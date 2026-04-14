# Chz Init:
The chz init command is responsible for preparing a directory to function as a Chz repository.
It initializes the structure required for chz operations like chz add, chz fetch, chz status and more.

when executed "chz init" creates a hidden directory in the project root. This directory will act as the heart
of the system and it stores all repository related data including commits, metadata and branches...

One of the primary components primary components of the chz init is the index file also known as the staging area
which will be elaborated on more in the description for git add, in short it allows users to control exactly what
modifications are recorded.

# Chz Merge:


# Chz Commit:

Committing changes is one of the core features of the system, as it defines the structure of the repository and maintains its history over time.

Although commits may appear to be simple snapshots of files, their underlying implementation is significantly more complex. Each commit is uniquely identified using a hashing mechanism. By hashing the content of a commit, the system ensures that even the smallest change produces a completely different identifier, guaranteeing integrity and uniqueness.

The system uses the SHA-1 hashing algorithm, which processes data in 512-bit (64-byte) blocks. If the data does not align perfectly with this block size, padding is applied to complete the final block. The result of this process is a fixed 20-byte hash, which is represented as a 40-character hexadecimal string.

This hash is used to organize objects within the repository. To avoid storing all objects in a single directory, the hash is split: the first two characters form the directory name, while the remaining characters form the filename. This structure improves filesystem efficiency and lookup performance.

Before being written to disk, commit data is compressed using the zlib library, which implements the DEFLATE algorithm. This ensures efficient storage without any loss of data.

In addition to hashing and compression, each commit follows a structured format consisting of a header and a body. The header specifies the object type and size, while the body contains metadata such as the associated tree, parent commits, author information, and the commit message.

The tree structure plays a critical role by representing the state of the filesystem at the time of the commit. It maps filenames to their corresponding hashed objects, allowing the system to reconstruct the full project state for any given commit.

# Backend:

The backend of the system is implemented using Node.js and Express.js, providing a lightweight and flexible framework
that integrates seamlessly with with the React-based frontend.

Typescript is used to enhanced the reliability and maintainability of the code through strong static typing.
This helps reduce runtime errors and improves overall code quality.

security is a major focus of the system. An authentication mechanism based on JSON Web Token (JWT) is implemented to
validate incoming requests. Only requests with valid tokens are permitted to trigger execution of C binaries. This
ensures that unauthorized or potentially malicious users cannot execute arbitrary commands or inject harmful scripts
into the system.

NB: Additional Precautions are considered when executing external libraries such as sanitizing inputs and restricting
allowed commands, to prevent command injection vulnerabilities.
