---
layout: ../../layouts/BlogLayout.astro
---
# Should you add the Gradle Wrapper to your repository?


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
The Gradle Wrapper scripts do **not** work without the Wrapper JAR present in the repository. Git is notoriously bad at efficiently handling binary files however, and executables are prone to tampering if they aren't properly verified. So should you be checking your Wrapper JAR into your repository?

### Wrapper Verification
***TODO***

### Repository size impact
For Gradle 8.8, the Wrapper JAR is only 44KB in size. That's more than twice as small as the size of an empty git repository (measuring about 116KB as of git version 2.34.1).

***TODO***
```
8.0K    ./.git/info
4.0K    ./.git/branches
4.0K    ./.git/refs/heads
4.0K    ./.git/refs/tags
12K     ./.git/refs
4.0K    ./.git/objects/info
4.0K    ./.git/objects/pack
12K     ./.git/objects
64K     ./.git/hooks
116K    ./.git
120K    .
```

## Conclusion
Yes, you should.

## Further Reading
- There is an open feature request on Gradle's GitHub to automatically download the Wrapper JAR using only the command-line scripts: https://github.com/gradle/gradle/issues/11816
- Inspired by the Gradle Wrapper, Apache has also created an official [Maven Wrapper](https://maven.apache.org/wrapper/index.html), providing similar functionality. It does however allow automatically downloading the Wrapper JAR if it's not already present in the repository, unlike Gradle's implementation where the command-line scripts can't run at all without the Wrapper JAR.