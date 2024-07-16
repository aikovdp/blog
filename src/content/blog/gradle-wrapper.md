---
title: Should you add the Gradle Wrapper to your repository?
date: 2024-07-17
description: What does the Graddle Wrapper do, and should you track it in your Git repository?
---

# Should you add the Gradle Wrapper to your repository?

## Table of Contents

## What is the Gradle Wrapper?

The Gradle Wrapper is a script that automatically runs the required Gradle version on the host machine, and downloads it if it's not already present. This drastically simplifies the installation of Gradle versions on developer machines and CI, and ensures everyone working on the same repository is using the same version of Gradle. As a result, the entry bar for newcomers to the project is lowered significantly, and builds are more reliable and reproducible. More information is provided in [Gradle's documentation](https://docs.gradle.org/current/userguide/gradle_wrapper.html).

### Using the Wrapper

To execute a Gradle build task in your repository, your command might look like this:

```bash
gradle build
```

Building a project using that command requires you to have a Gradle distribution expected by the project's build scripts installed on your machine and added to your PATH. If you don't, the build might fail in any way. The Wrapper provides an elegant solution: simply execute the Wrapper script instead of the Gradle command.

```sh
./gradlew build
```

This will automatically use the Gradle distribution declared by the project, and will even download it if necessary, eliminating a whole host of installation, debugging and build problems.

### File Layout

The Gradle Wrapper is typically spread across four files in a repository: Two command line scripts (one for UNIX, one for Windows systems), a properties file, and a Wrapper JAR.

```
gradlew
gradlew.bat
gradle
├── gradle-wrapper.jar
└── gradle-wrapper.properties
```

The two script files delegate their work to the Wrapper JAR, which in turn provides the Gradle version declared in the properties file.

## What's the problem?

The Gradle Wrapper scripts do **not** work without the Wrapper JAR present in the repository. Executables are prone to tampering if they aren't properly verified however, and storing binary files in a Git repository is often considered a bad practice. So should you be checking your Wrapper JAR into your repository?

### Wrapper Verification

Since a JAR file doesn't contain plain text, it can't easily be reviewed through simple git diffs. Contributions that claim to update a project's Wrapper JAR could replace it with a malicious file, which could then execute any code the next time the Wrapper is used. To mitigate attacks like these, Gradle has created an official GitHub Action which verifies the integrity of the Wrapper JAR. It can easily be used in a simple workflow.

```yaml
name: "Validate Gradle Wrapper"

on:
  push:
  pull_request:

jobs:
  validation:
    name: "Validation"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: gradle/actions/wrapper-validation@v3
```

With this workflow, any pushed commit or pull request will automatically be checked for unknown Wrappper JARS.

Gradle also publishes SHA-256 hashes of all releases, including those of the Wrapper JARS, so they can be verified manually if using the official GitHub Action isn't an option. For more information, check [their documentation](https://docs.gradle.org/current/userguide/gradle_wrapper.html#wrapper_checksum_verification).

### Repository size impact

It's often said that binary files typically shouldn't be stored in Git repositories, as they can't easily be diffed and could cause a significant repository size increase over time. Tools like [Git LFS](https://git-lfs.com/) exist to handle these shortcomings for large binary files.

But the Gradle Wrapper JAR isn't a large file. For Gradle 8.9, the Wrapper JAR is only 44KB in size. That's more than twice as small as the size of an empty git repository (measuring about 116KB as of git version 2.34.1). The initial storage cost of the JAR is negligible, but how does that evolve as more commits are added to the repository?

Any commit to the repository that doesn't change the JAR, won't increase the repository's size by the size of the JAR. Git uses a content-adressable filesystem, where each object is at an address derrived from its content. If the content doesn't change, no new file is created in its filesystem--it's already there. More details on these inner workings can be found in [chapter 10.2 of the Pro Git book](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects).

A commit in which the JAR does change, such as when the project's Gradle version is updated, will initially increase the repository size with the (gzipped) size of the Wrapper JAR. The same would happen for any change to a text file; Git stores a full copy of the changed file for every commit. Over time however, Git optimizes storage space, and stores these snapshots only as the deltas from one version of the object to another, packaged into a [packfiles](https://git-scm.com/book/en/v2/Git-Internals-Packfiles). These deltas may be more storage-efficient for plain text files that for JARs, but they are always stored as such, regardless of the original file type.

To measure the impact of a change to the Wrapper JAR, we'll initialize a new Gradle 8.8 project and commit it to a new Git repository.

```sh
gradle init # Following all default options
git init
git add --all
git commit -m "Initial project"
git gc # Let git optimize the repository to reflect impact over time
```

At this point, the git objects take up 72 kilobytes.

```shellsession
$ du .git/objects/
12      objects/info
56      objects/pack
72      objects/
```

To see the size increase after the JAR changes, we'll update our Wrapper from Gradle 8.8 to 8.9 and commit it to the repository.

```sh
./gradlew wrapper --gradle-version latest
# After running this command, all 4 Wrapper
# files have been modified, including the JAR
git add --all
git commit -m "Update to Gradle 8.9"
git gc
```

```shellsession
$ du .git/objects/
12      .git/objects/info
64      .git/objects/pack
80      .git/objects/
```

The Wrapper update increased the size of our git repository by 8 kilobytes, despite the Wrapper JAR being 44 KB in size. Assuming a similar size increase for each Gradle update, 8KB for each of the 140 Gradle versions released since it's inception in 2008, would still only amount to a little over a megabyte. The Gradle Wrapper's impact on the size of your repository is _very_ minimal.

## Conclusion

You can safely keep the Wrapper JAR in your git repository. Provided you follow the recommended stepts to verify the integrity of your Wrapper, storing it is completely safe and tamper-proof, and its storage impact is absolutely minimal in every case.

---

## Further Reading

- There is an [open feature request](https://github.com/gradle/gradle/issues/11816) on Gradle's GitHub to automatically download the Wrapper JAR using only the command-line scripts.
- Inspired by the Gradle Wrapper, Apache has also created an official [Maven Wrapper](https://maven.apache.org/wrapper/index.html), providing similar functionality. It does however allow automatically downloading the Wrapper JAR if it's not already present in the repository, unlike Gradle's implementation where the command-line scripts can't run at all without the Wrapper JAR.
