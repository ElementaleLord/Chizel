#include "../include/headers/merge.h"
#include "../include/headers/commit.h"
#include <openssl/evp.h>
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

void lcsConflicts(const char *base_conflict, const char *relative_path)
{
    char fullpath[4096];

    snprintf(fullpath, sizeof(fullpath), "%s/%s", base_conflict, relative_path);

    DIR *dir = opendir(fullpath);
    if (!dir)
        return;

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL)
    {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
            continue;

        char new_rel[4096];
        if (strlen(relative_path) == 0)
            snprintf(new_rel, sizeof(new_rel), "%s", entry->d_name);
        else
            snprintf(new_rel, sizeof(new_rel), "%s/%s", relative_path, entry->d_name);

        char conflict_path[8192];
        snprintf(conflict_path, sizeof(conflict_path), "%s/%s", base_conflict, new_rel);

        if (isDir(conflict_path))
        {
            lcsConflicts(base_conflict, new_rel);
        }
        else
        {
            char real_path[8192];
            snprintf(real_path, sizeof(real_path), "./%s", new_rel);

            if (isBinary(real_path) || isBinary(conflict_path))
            {
                printf("Binary File: %s\n", new_rel);
                continue;
            }

            printf("File: %s =========================\n", new_rel);

            FILE *f1 = fopen(real_path, "r");
            FILE *f2 = fopen(conflict_path, "r");

            if (!f1 || !f2)
            {
                if (f1)
                    fclose(f1);
                if (f2)
                    fclose(f2);
                continue;
            }

            Lines old_file = read_file(f1);
            Lines new_file = read_file(f2);
            Lines out = {0};

            lcs(new_file, old_file, &out);

            for (size_t i = 0; i < out.size; i++)
                printf("%s", out.content[i]);

            printf("====================================\n\n");

            fclose(f1);
            fclose(f2);
        }
    }

    closedir(dir);
}

int countDirectory(const char *path)
{
    int count = 0;

    DIR *dir = opendir(path);
    if (!dir)
        return 0;

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL)
    {
        if (strcmp(entry->d_name, ".") == 0 ||
            strcmp(entry->d_name, "..") == 0)
            continue;

        count++;

        char fullpath[4096];
        snprintf(fullpath, sizeof(fullpath), "%s/%s", path, entry->d_name);

        struct stat st;
        if (stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode))
        {
            count += countDirectory(fullpath);
        }
    }

    closedir(dir);
    return count;
}

int getFileHash(const char *path, char out_buffer[65])
{
    FILE *f_ptr = fopen(path, "rb");
    if (!f_ptr)
    {
        printf(MERGE_ERROR_MSG_START "Couldnt hash %s" MSG_END, path);
        return 0;
    }

    EVP_MD_CTX *context = EVP_MD_CTX_new();
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hash_length = 0;

    EVP_DigestInit_ex(context, EVP_sha256(), NULL);

    unsigned char buffer[8192];
    size_t bytes_read;
    while ((bytes_read = fread(buffer, 1, sizeof(buffer), f_ptr)) != 0)
    {
        EVP_DigestUpdate(context, buffer, bytes_read);
    }

    EVP_DigestFinal_ex(context, hash, &hash_length);

    for (unsigned int i = 0; i < hash_length; i++)
    {
        sprintf(out_buffer + (i * 2), "%02x", hash[i]);
    }
    out_buffer[64] = '\0';

    EVP_MD_CTX_free(context);
    fclose(f_ptr);

    return 1;
}

int checkSum(const char *file1, const char *file2)
{
    struct stat s1, s2;

    if (stat(file1, &s1) != 0 || stat(file2, &s2) != 0)
    {
        printf(MERGE_ERROR_MSG_START "Couldnt map file details" MSG_END);
        return -1;
    }

    if (s1.st_size != s2.st_size)
        return 0;

    char hash1[65], hash2[65];
    if (!getFileHash(file1, hash1) || !getFileHash(file2, hash2))
    {
        printf(MERGE_ERROR_MSG_START "Couldnt hash files" MSG_END);
        return -1;
    }

    if (strcmp(hash1, hash2) == 0)
        return 1;

    return 0;
}

void ensureParentDir(const char *path)
{
    char tmp[2048];
    snprintf(tmp, sizeof(tmp), "%s", path);

    for (char *p = tmp + 1; *p; p++)
    {
        if (*p == '/')
        {
            *p = '\0';
#ifdef _WIN32
            mkdir(tmp);
#else
            mkdir(tmp, 0755);
#endif
            *p = '/';
        }
    }
}

bool checkFiles(const char *base, const char *rel)
{
    DIR *dir = opendir(base);
    if (!dir)
        return false;

    struct dirent *entry;
    struct stat st;

    char fullPath[1024];
    char relPath[1024];
    char tmpFile[2048];
    char confPath[2048];

    while ((entry = readdir(dir)) != NULL)
    {
        if (strcmp(entry->d_name, ".") == 0 ||
            strcmp(entry->d_name, "..") == 0 ||
            strcmp(entry->d_name, ".chz") == 0)
            continue;

        snprintf(fullPath, sizeof(fullPath), "%s/%s", base, entry->d_name);

        if (rel[0] == '\0')
            snprintf(relPath, sizeof(relPath), "%s", entry->d_name);
        else
            snprintf(relPath, sizeof(relPath), "%s/%s", rel, entry->d_name);

        if (stat(fullPath, &st) != 0)
        {
            closedir(dir);
            return false;
        }

        if (S_ISDIR(st.st_mode))
        {
            if (!checkFiles(fullPath, relPath))
            {
                closedir(dir);
                return false;
            }
        }
        else
        {
            snprintf(tmpFile, sizeof(tmpFile), ".chz/tmp/%s", relPath);

            struct stat tmpSt;
            if (stat(tmpFile, &tmpSt) == 0 && S_ISREG(tmpSt.st_mode))
            {
                int r = checkSum(fullPath, tmpFile);

                if (r == 1)
                {
                    remove(tmpFile);
                }
                else if (r == 0)
                {
                    snprintf(confPath, sizeof(confPath), ".chz/conflicts/%s", relPath);

                    // ensure parent directories exist
                    ensureParentDir(confPath);

                    // prevent writing over directory
                    struct stat dstSt;
                    if (stat(confPath, &dstSt) == 0 && S_ISDIR(dstSt.st_mode))
                    {
                        printf("ERROR: %s is a directory\n", confPath);
                        closedir(dir);
                        return false;
                    }

                    FILE *src = fopen(tmpFile, "rb");
                    FILE *dst = fopen(confPath, "wb");

                    if (!src || !dst)
                    {
                        if (src)
                            fclose(src);
                        if (dst)
                            fclose(dst);
                        closedir(dir);
                        return false;
                    }

                    char buf[4096];
                    size_t n;

                    while ((n = fread(buf, 1, sizeof(buf), src)) > 0)
                    {
                        fwrite(buf, 1, n, dst);
                    }

                    fclose(src);
                    fclose(dst);

                    remove(tmpFile);
                }
                else
                {
                    printf("error\n");
                    closedir(dir);
                    return false;
                }
            }
        }
    }

    closedir(dir);
    return true;
}

//~ Overwrites data on current directory based on branch's, then creates a custom commit
int fastForwardMerge(char *branch)
{
    char pack[1024];
    snprintf(pack, sizeof(pack), "%s/%s/data.pack", DATA_PATH, branch);

    int r = restorePack(pack, ".");

    char message[128];
    snprintf(message, 128, "Merging %s to %s", branch, getHead());

    char *args[] = {"./commit", "-m", message};
    int count = 3;

    commit(count, args);

    return r;
}

//~ copies data from a src file to a target file
bool copyFile(const char *src, const char *dest)
{
    FILE *fp_src, *fp_dest;
    char buffer[1024];
    size_t bytesRead;

    fp_src = fopen(src, "rb");
    if (!fp_src)
    {
        printf(MERGE_ERROR_MSG_START "Failed To Open Source" MSG_END);
        whatIsTheError();
        return false;
    }

    fp_dest = fopen(dest, "wb");
    if (!fp_dest)
    {
        fclose(fp_src);
        printf(MERGE_ERROR_MSG_START "Failed To Open Destination %s" MSG_END, dest);
        whatIsTheError();
        return false;
    }

    while ((bytesRead = fread(buffer, 1, sizeof(buffer), fp_src)) > 0)
    {
        fwrite(buffer, 1, bytesRead, fp_dest);
    }

    fclose(fp_src);
    fclose(fp_dest);
    return true;
}

//~ used to recurcively combine all files from the source to the destination
bool mergeRec(const char *srcPath, const char *destPath)
{
    DIR *p_srcDir = opendir(srcPath);
    struct dirent *srcIter;
    struct stat st;

    char fileFromSrc[1024], fileFromDest[1024];

    if (!p_srcDir)
    {
        printf(MERGE_ERROR_MSG_START "Failed To Open Directory %s" MSG_END, srcPath);
        return false;
    }

    while ((srcIter = readdir(p_srcDir)) != NULL)
    {
        if (strcmp(srcIter->d_name, ".") == 0 ||
            strcmp(srcIter->d_name, "..") == 0)
            continue;

        snprintf(fileFromSrc, sizeof(fileFromSrc), "%s/%s", srcPath, srcIter->d_name);
        snprintf(fileFromDest, sizeof(fileFromDest), "%s/%s", destPath, srcIter->d_name);

        if (stat(fileFromSrc, &st) < 0)
        {
            closedir(p_srcDir);
            printf(MERGE_ERROR_MSG_START "Failed To Read From Path %s" MSG_END, fileFromSrc);
            return false;
        }

        if (S_ISDIR(st.st_mode))
        {
            // create destination directory ONLY for directories
            if (!dirExists(fileFromDest))
            {
#ifdef _WIN32
                if (mkdir(fileFromDest) < 0)
#else
                if (mkdir(fileFromDest, DEF_PERM) < 0)
#endif
                {
                    closedir(p_srcDir);
                    printf(MERGE_ERROR_MSG_START "Failed To Create Directory %s" MSG_END, fileFromDest);
                    return false;
                }
            }

            if (!mergeRec(fileFromSrc, fileFromDest))
            {
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START "Failed To Recursively Merge %s and %s" MSG_END, fileFromSrc, fileFromDest);
                return false;
            }
        }
        else
        {
            if (!copyFile(fileFromSrc, fileFromDest))
            {
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START "Failed To Copy Files from %s to %s" MSG_END, fileFromSrc, fileFromDest);
                return false;
            }
        }
    }

    closedir(p_srcDir);
    return true;
}

//~ searches destination path for the same name
bool searchSameName(const char *dest, const char *fileName, const char *src)
{
    DIR *dir = opendir(dest);
    struct dirent *entry;
    struct stat st;
    char fullPath[1024];

    if (dir == NULL)
    {
        printf(MERGE_ERROR_MSG_START "Failure whilst openning %s directory" MSG_END, src);
        whatIsTheError();
        return false;
    }

    while ((entry = readdir(dir)) != NULL)
    {
        if (strcmp(entry->d_name, ".") != 0 && strcmp(entry->d_name, "..") != 0)
        {
            snprintf(fullPath, sizeof(fullPath), "%s/%s", src, entry->d_name);

            if (stat(fullPath, &st) != 0)
            {
                closedir(dir);
                printf(MERGE_ERROR_MSG_START "Failure whilst reading path %s" MSG_END, fullPath);
                whatIsTheError();
                return false;
            }

            if (S_ISDIR(st.st_mode))
            {
                if (!searchSameName(fullPath, fileName, src))
                {
                    closedir(dir);
                    return false;
                }
            }
        }
    }

    closedir(dir);
    return true;
}

//~ Returns the commit's hash from a log entry
char *readCommitHash(char *line)
{
    char *hash = malloc(65);
    char parentHash[65];

    int fields = sscanf(
        line,
        "%64s %64s",
        parentHash, hash);

    if (fields != 2)
    {
        free(hash);
        return NULL;
    }

    return hash;
}

//~ Returns a commit's hash an offset amount of commits pre-latest
char *getSpecificHash(char *branch, int offset)
{

    char log[1024];
    snprintf(log, sizeof(log), "%s%s.log", LOGS_PATH, branch);

    FILE *f = fopen(log, "r");
    if (!f)
    {
        return NULL;
    }

    fseek(f, 0, SEEK_END);
    long pos = ftell(f);

    char line[4096];
    int n = 0;
    size_t len = 0;
    char *hash = NULL;
    int c;

    while (pos >= 0 && n <= offset)
    {
        pos--;

        if (pos == 0)
        {
            c = '\n'; // force flush last line
        }
        else
        {
            fseek(f, pos, SEEK_SET);
            c = fgetc(f);
        }

        if (c == '\n')
        {
            if (len > 0)
            {
                line[len] = '\0';
                reverseString(line);
                len = 0;
                hash = readCommitHash(line);
                n++;
            }
        }

        else if (len < sizeof(line) - 1)
        {
            line[len++] = (char)c;
        }
    }

    if (len > 0 && n < offset)
    {
        line[len] = '\0';
        reverseString(line);
        hash = readCommitHash(line);
        n++;
    }

    fclose(f);

    return hash;
}

//~ Checks if head & branch share a commit hash based on offset
int commitsTreeCheck(char *head, char *branch, int head_offset)
{
    char *headHash;
    bool freeHash = false;
    if (head_offset == 0)
    {
        headHash = getLatestHash(head);
    }
    else
    {
        headHash = getSpecificHash(head, head_offset);
        freeHash = true;
    }

    if (!headHash)
    {
        return -1;
    }

    char log[1024];
    snprintf(log, sizeof(log), "%s%s.log", LOGS_PATH, branch);

    FILE *f = fopen(log, "r");
    if (!f)
    {
        return -1;
    }

    fseek(f, 0, SEEK_END);
    long pos = ftell(f);

    char line[4096];
    bool cont = true, found = false;
    size_t len = 0;
    char *hash;
    int c;

    while (pos >= 0 && cont)
    {
        pos--;

        if (pos == 0)
        {
            c = '\n'; // force flush last line
        }
        else
        {
            fseek(f, pos, SEEK_SET);
            c = fgetc(f);
        }

        if (c == '\n')
        {
            if (len > 0)
            {
                line[len] = '\0';
                reverseString(line);
                len = 0;
                hash = readCommitHash(line);
                if (hash == NULL)
                {
                    cont = false;
                }
                else
                {
                    if (strcmp(hash, headHash) == 0)
                    {
                        cont = false;
                        found = true;
                    }
                }
            }
        }
        else if (len < sizeof(line) - 1)
        {
            line[len++] = (char)c;
        }
    }

    if (len > 0 && cont)
    {
        line[len] = '\0';
        reverseString(line);
        hash = readCommitHash(line);
        if (hash == NULL)
        {
            cont = false;
        }
        else
        {
            if (strcmp(hash, headHash) == 0)
            {
                cont = false;
            }
        }
    }

    fclose(f);
    if (freeHash)
    {
        free(headHash);
    }

    if (found)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

//~ gets the current branch to use as the target of the merge then calls doMerge
void curMerge(char *head, char *branch)
{
    if (!branchExists(branch) || !branchExists(head))
    {
        printf(MERGE_ERROR_MSG_START "Either %s or %s does not exist." MSG_END, head, branch);
        return;
    }

    //@ Fast Forward Applicable?
    int r = commitsTreeCheck(head, branch, 0);

    if (r == 1)
    {
        if (!fastForwardMerge(branch))
        {
            printf(MERGE_ERROR_MSG_START "Couldnt merge %s to %s" MSG_END, branch, head);
        }
        printf(MERGE_REPORT_MSG_START "Successfully merged %s to %s" MSG_END, branch, head);
        return;
    }

    int i = 0;
    while (r != 1 && i < 50)
    {
        i++;
        r = commitsTreeCheck(head, branch, i);
        if (r < 0)
        {
            printf(MERGE_ERROR_MSG_START "Error whilst finding common ancestor" MSG_END);
            return;
        }
    }

    zipDirectory(STORE_DATA);

    char headPack[1024], branchPack[1024];
    snprintf(headPack, sizeof(headPack), "%s/%s/data.pack", DATA_PATH, head);
    snprintf(branchPack, sizeof(branchPack), "%s/%s/data.pack", DATA_PATH, branch);

    if (!checkForFile(headPack) || !checkForFile(branchPack))
    {
        printf(MERGE_ERROR_MSG_START "Missing data packs" MSG_END);
        return;
    }

    // checksum check for no changes between packs
    if (checkSum(headPack, branchPack))
    {
        printf(MERGE_REPORT_MSG_START "Data is exactly the same between head and %s, merge \"success\"" MSG_END, branch);
        return;
    }

// create a new tmp directory in .chz, extract branch's data.pack in it
#ifdef _WIN32
    mkdir(".chz/tmp");
    mkdir(".chz/conflicts");
#else
    mkdir(".chz/tmp", DEF_PERM);
    mkdir(".chz/conflicts", DEF_PERM);
#endif
    restorePack(branchPack, ".chz/tmp");

    // loop the files in head, checkSameName() in tmp directory
    // if file with same name found, do checksum, not different => remove file from tmp
    // if different => copy to a new .chz conflicts directory => remove from tmp
    checkFiles(".", "");

    // when done, copy all files in tmp to head as they arent in head directory
    int c = countDirectory(".chz/conflicts");
    int new = countDirectory(".chz/tmp");
    if (c == 0)
    {
        printf(MERGE_REPORT_MSG_START "No conflicts recorded, merge success" MSG_END);
        mergeRec(".chz/tmp", ".");
        removeDir(".chz/tmp");
        removeDir(".chz/conflicts");
        return;
    }

    // then do LCS on the files in conflicts
    printf("There is at least %d conflicted files and %d new non-conflicted files\n", c, new);
    printf("Please resolves your merge conflicts: \n");

    lcsConflicts(".chz/conflicts", "");
    removeDir(".chz/tmp");
    removeDir(".chz/conflicts");
}

//~ used to display help message replated to merge
void mergeHelp()
{
    printf(MERGE_REPORT_MSG_START "\nUsage: chz merge <branch-name>, chz merge <compare-name> <base-name> (!)" MSG_END);
}

//~ handles cases based on arguments to call needed functions
void merge(int argc, char *argv[])
{
    switch (argc)
    {
    //@ chz merge <arg>
    case (ARG_BASE + 3):
        if (strcmp(argv[ARG_BASE + 2], "-h") == 0)
        { //% chz merge -h
            mergeHelp();
        }
        else
        { //% chz merge <branch-name>
            if (!checkChz)
            {
                printf(CHZ_ERROR_MSG_START "Not in a .chz directory" MSG_END);
                return;
            }

            curMerge(getHead(), argv[ARG_BASE + 2]);
        }
        break;

    //@ chz merge <arg> <arg>
    case (ARG_BASE + 4):
        //% chz merge <compare-branch> <base-branch>
        if (!checkChz)
        {
            printf(CHZ_ERROR_MSG_START "Not in a .chz directory" MSG_END);
            return;
        }
        printf(MERGE_REPORT_MSG_START "Unfortunately, this feature has not been made yet" MSG_END);
        printf("But you could do the following to achieve the same result: \n");
        printf("chz checkout %s <= then => chz merge %s", argv[ARG_BASE + 2], argv[ARG_BASE + 3]);

        break;

    default:
        printf(CHZ_ERROR_MSG_START "Invalid Command" MSG_END);
        break;
    }
}