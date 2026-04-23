#include "../include/chizel.h"
#include "commit.c"
#include <openssl/evp.h>
#include <dirent.h>
#include <errno.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

typedef struct
{
    char *src;
    char *dest;
    char *newer;
} ConflictPair;

typedef struct
{
    ConflictPair *pair;
    size_t size;
    size_t capacity;
} ConflictVector;

int get_file_hash(const char *path, char out_buffer[65])
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

int check_sum(const char *file1, const char *file2)
{
    struct stat *s1, *s2;

    if (!stat(file1, s1) || !stat(file2, s2))
    {
        printf(MERGE_ERROR_MSG_START "Couldnt map file details" MSG_END);
        return -1;
    }

    if (s1->st_size != s2->st_size) return 0;

    char hash1[65], hash2[65];
    if (!get_file_hash(file1, hash1) || !get_file_hash(file2, hash2))
    {
        printf(MERGE_ERROR_MSG_START "Couldnt hash files"MSG_END);
        return -1;
    }

    if(strcmp(hash1, hash2) == 0) return 1;

    return 0;
}

bool checkFiles(const char *base, const char *rel)
{
    DIR *dir = opendir(base);
    struct dirent *entry;
    struct stat st;
    char fullPath[1024], relPath[1024], tmpFile[1024];

    if (dir == NULL)
    {
        return false;
    }

    while ((entry = readdir(dir)) != NULL)
    {
        if (strcmp(entry->d_name, ".") != 0 && strcmp(entry->d_name, "..") != 0 && strcmp(entry->d_name, ".chz"))
        {
            snprintf(fullPath, sizeof(fullPath), "%s/%s", base, entry->d_name);

            if(strlen(rel) == 0){
                snprintf(relPath, sizeof(relPath), "%s", entry->d_name);
            }
            else
            {
                snprintf(relPath, sizeof(relPath), "%s/%s", rel, entry->d_name);
            }

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
                char confPath[1024];
                snprintf(confPath, sizeof(confPath), ".chz/conflicts/%s", relPath);
                snprintf(tmpFile, sizeof(tmpFile), ".chz/tmp/%s", relPath);
                struct stat tmpSt;

                if(stat(tmpFile, &tmpSt) == 0 && S_ISREG(tmpSt.st_mode))
                {
                    if(check_sum(fullPath, tmpFile) == 0)
                    {
                        remove(tmpFile);
                    }
                    else
                    {
                        FILE* src = fopen(tmpFile, "rb");
                        FILE* dst = fopen(confPath, "wb");
                        if(src && dst)
                        {
                            char buf[4096];
                            size_t n;
                            while((n = fread(buf, 1, sizeof(buf), src)) > 0)
                            {
                                fwrite(buf, 1, n ,dst);
                            }
                        }

                        fclose(src);
                        fclose(dst);
                        remove(tmpFile);
                    }
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
        printf(MERGE_ERROR_MSG_START "Failed To Open Destination %s: %s" MSG_END, dest, strerror(errno));
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
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    while ((srcIter = readdir(p_srcDir)) != NULL)
    {
        if (strcmp(srcIter->d_name, ".") == 0 || strcmp(srcIter->d_name, "..") == 0)
        {
            continue;
        }

        snprintf(fileFromSrc, sizeof(fileFromSrc), "%s/%s", srcPath, srcIter->d_name);
        snprintf(fileFromDest, sizeof(fileFromDest), "%s/%s", destPath, srcIter->d_name);

        if (stat(fileFromSrc, &st) < 0)
        {
            closedir(p_srcDir);
            printf(MERGE_ERROR_MSG_START "Failed To Read From Path %s" MSG_END, fileFromSrc);
            whatIsTheError();
            return false;
        }

        if (!dirExists(fileFromDest))
        {
        #ifdef _WIN32
            if (mkdir(fileFromDest) < 0)
        #else
            if (mkdir(fileFromDest, DEF_PERM) < 0)
        #endif
            {
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START "Failed To Create Directory %s: %s" MSG_END, fileFromDest, strerror(errno));
                whatIsTheError();
                return false;
            }
        }

        if (S_ISDIR(st.st_mode))
        {
            if (!mergeRec(fileFromSrc, fileFromDest))
            {
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START "Failed To Recursively Merge %s and %s" MSG_END, fileFromSrc, fileFromDest);
                whatIsTheError();
                return false;
            }
        }
        else
        {
            if (!copyFile(fileFromSrc, fileFromDest))
            {
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START "Failed To Copy Files from %s to %s" MSG_END, fileFromSrc, fileFromDest);
                whatIsTheError();
                return false;
            }
        }
    }

    closedir(p_srcDir);
    return true;
}

//~ starts the merge <some> checks
bool doMerge(DIR *p_dir, const char *source, const char *target)
{
    char srcPath[1024], destPath[1024];

    snprintf(srcPath, sizeof(srcPath), "%s/%s", BRANCHES_PATH, source);
    snprintf(destPath, sizeof(destPath), "%s/%s", BRANCHES_PATH, target);

    if (!dirExists(srcPath))
    {
        printf(MERGE_ERROR_MSG_START "source %s Does Not Exist." MSG_END, source);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    if (!dirExists(destPath))
    {
        printf(MERGE_ERROR_MSG_START "target %s Does Not Exist." MSG_END, target);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    if (!(mergeRec(srcPath, destPath)))
    {
        printf(MERGE_ERROR_MSG_START "Failed To Merge %s to %s." MSG_END, source, target);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }
    else
    {
        printf(MERGE_REPORT_MSG_START "Merged %s to %s successfully." MSG_END, source, target);
        return true;
    }
}

//~ perma copies the string onto another (via heap memory)
char *cloneString(const char *s)
{
    size_t len = strlen(s) + 1;
    char *copy = malloc(len);
    if (copy != NULL)
    {
        memcpy(copy, s, len);
    }
    return copy;
}

//~ vector size check, pair existence check and conflict storing
bool pushConflict(ConflictVector *v, const char *src, const char *dest)
{
    if (v->size == v->capacity)
    {
        size_t newCap = (v->capacity == 0) ? 8 : v->capacity * 2;
        ConflictPair *data = realloc(v->pair, newCap * sizeof(ConflictPair));
        if (data == NULL)
            return false;
        v->pair = data;
        v->capacity = newCap;
    }

    v->pair[v->size].src = cloneString(src);
    v->pair[v->size].dest = cloneString(dest);
    v->pair[v->size].newer = NULL;

    if (v->pair[v->size].src == NULL || v->pair[v->size].dest == NULL)
    {
        free(v->pair[v->size].src);
        free(v->pair[v->size].dest);
        free(v->pair[v->size].newer);
        return false;
    }

    v->size++;
    return true;
}

//~ clears the conflict vector
void clearConflictVector(ConflictVector *vec)
{
    size_t i;

    for (i = 0; i < vec->size; i++)
    {
        free(vec->pair[i].src);
        free(vec->pair[i].dest);
        free(vec->pair[i].newer);
    }

    free(vec->pair);
    vec->pair = NULL;
    vec->size = 0;
}

//~ searches destination path for the same name
bool searchSameName(const char *dest, const char *fileName, const char *src, ConflictVector *v)
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
                if (!searchSameName(fullPath, fileName, src, v))
                {
                    closedir(dir);
                    return false;
                }
            }
            else
            {
                if (strcmp(entry->d_name, fileName) == 0)
                {
                    if (!pushConflict(v, src, fullPath))
                    {
                        closedir(dir);
                        printf(MERGE_ERROR_MSG_START "Failed to store conflict paths" MSG_END);
                        whatIsTheError();
                        return false;
                    }
                }
            }
        }
    }

    closedir(dir);
    return true;
}

//~ stores conflicts in a "vector<pair<char*, char*, char*>>" (ik its not technically a pair)
bool collectFileConflicts(const char *src, const char *dest, ConflictVector *conflicts)
{
    DIR *dir = opendir(src);
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
                if (!collectFileConflicts(fullPath, dest, conflicts))
                {
                    closedir(dir);
                    return false;
                }
            }
            else
            {
                if (!searchSameName(dest, entry->d_name, fullPath, conflicts))
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

//~ checks both directories for conflicts of files
bool checkFileConflicts(const char *pathSrc, const char *pathDest)
{
    ConflictVector conflicts;
    struct stat stSrc, stDest;
    size_t i;

    if (!collectFileConflicts(pathSrc, pathDest, &conflicts))
    {
        clearConflictVector(&conflicts);
        return false;
    }

    for (i = 0; i < conflicts.size; i++)
    {
        if (stat(conflicts.pair[i].src, &stSrc) != 0 || stat(conflicts.pair[i].dest, &stDest) != 0)
        {
            printf(MERGE_ERROR_MSG_START "Failed To Stat Conflict Paths" MSG_END);
            whatIsTheError();
            clearConflictVector(&conflicts);
            return false;
        }

        if (stSrc.st_mtime > stDest.st_mtime)
            conflicts.pair[i].newer = cloneString(conflicts.pair[i].src);

        else if (stDest.st_mtime > stSrc.st_mtime)
            conflicts.pair[i].newer = cloneString(conflicts.pair[i].dest);

        else
            conflicts.pair[i].newer = NULL;

        printf("Conflict:\n");
        printf("-  %s\n", conflicts.pair[i].src);
        printf("-  %s\n", conflicts.pair[i].dest);

        if (conflicts.pair[i].newer != NULL)
        {
            printf("  Newer: %s\n", conflicts.pair[i].newer);
        }
        else
        {
            printf("  Both have the same modification time\n");
        }
    }

    clearConflictVector(&conflicts);
    return true;
}

//~ used to identify if there is merge conflicts between the two branchs
bool checkMergeConflicts(const char *src, const char *dest)
{
    if (strcmp(src, dest) == 0)
    {
        printf(MERGE_ERROR_MSG_START "Cannot Merge A Branch With Itself, what are u trying to do?" MSG_END);
        whatIsTheError();
        return false;
    }

    char pathSrc[1024], pathDest[1024];
    snprintf(pathSrc, sizeof(pathSrc), "%s/%s", BRANCHES_PATH, src);
    if (!dirExists(pathSrc))
    {
        printf(MERGE_ERROR_MSG_START "Branch %s Does Not Exist" MSG_END, src);
        whatIsTheError();
        return false;
    }

    snprintf(pathDest, sizeof(pathDest), "%s/%s", BRANCHES_PATH, dest);
    if (!dirExists(pathDest))
    {
        printf(MERGE_ERROR_MSG_START "Branch %s Does Not Exist" MSG_END, dest);
        whatIsTheError();
        return false;
    }

    // second base case is that the common ancestor commit between target and source is itself source
    //     //$ the below is probably gonna be a function of its own that this func calls
    //     in which case first call commit to create a merge commit on source
    //         which will store the fact that there is two prev commits which allows us to differentiate merge commit from normal ones
    //         then overwrite the head of target to be the same as the head of source
    //         because in this case source is technically just a newer version of target
    //         but head of target cant be the same as head of source so maybe make two commits with reversed params
    //         like mergeCommit(src, tar); mergeCommit(tar, src);
    //     //$ the above is probably gonna be a function of its own that this func calls
}
/*
^ P: hmm tho like mentioned above if there is a mergeCommit() and we store the commit IN the branch Dir itself
^ P: that would mean we now either have two commits practically holding the same data or one branch head is referencing
^ P: a commit outside its own branch Dir >:/
? P: or this implies that doMerge() needs to be changed far more than just a param switch\
? O: are u speaking english?

& P: function work follow and my idea of what each one does
- preDoMerge() and curMerge()
    both are supposed to handle validating that the given paths are valid
    both take only the NAME of the branches to check (tho note that curMerge needs to read HEAD to get the target name/path)
    if passes all checks calls checkMergeConflicts() while passing both branch paths as args
- checkMergeConflicts() [current function]
    handles detecting merge conflicts
    takes the PATH to each branch as params
    if passes all checks whithout fallinf in a base case calls doMerge() while passing both branch paths as args
- doMerge()
    actually performs the steps needed to merge the branches
    takes the PATH to each branch as params
*/

//~ helper used to handle prerequisite checks prior to calling doMerge()
void preDoMerge(DIR *p_dir, const char *source, const char *target)
{

    if (doMerge(p_dir, source, target))
    {
        printf(MERGE_REPORT_MSG_START "Merge Sucessful" MSG_END);
    }
    else
    {
        printf(MERGE_ERROR_MSG_START "Failed To Merge %s and %s" MSG_END, source, target);
        whatIsTheError();
    }
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
int commitsTreeCheck(char *head, char *branch, Stack *commits, int head_offset)
{
    clearStack(commits);
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
    // char* branchHash = getLatestHash(branch);

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
                    else
                    {
                        push(commits, hash);
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
            else
            {
                push(commits, hash);
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
void curMerge(char *branch)
{
    char *head = getHead();

    if (!branchExists(branch))
    {
        printf(MERGE_ERROR_MSG_START "Branch %s does not exist." MSG_END, branch);
        return;
    }

    Stack commits;
    initStack(&commits);

    //@ Fast Forward Applicable?
    int r = commitsTreeCheck(head, branch, &commits, 0);

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
        r = commitsTreeCheck(head, branch, &commits, i);
        if (r < 0)
        {
            printf(MERGE_ERROR_MSG_START "Error whilst finding common ancestor" MSG_END);
            return;
        }
    }
    printf("There is %d commits between the current %s head and the common ancestor commit\n", i, getHead());

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
    if(check_sum(headPack, branchPack)){
        printf(MERGE_REPORT_MSG_START"Data is exactly the same between head and %s, merge \"success\""MSG_END, branch);
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
    checkFiles(".chz/tmp", ".");

    // when done, copy all files in tmp to head as they arent in head directory
    mergeRec(".chz/tmp", ".");

    // then do LCS on the files in conflicts
}

//~ used to display help message replated to merge
void mergeHelp()
{
    printf(MERGE_REPORT_MSG_START "\nUsage: chz merge <branch-name>, chz merge <compare-name> <base-name>" MSG_END);
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
            curMerge(argv[ARG_BASE + 2]);
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
        // doMerge(argv[ARG_BASE+ 2], argv[ARG_BASE+ 3]);
        //& P: the compare branch will be merged into the base branch

        break;

    default:
        printf(CHZ_ERROR_MSG_START "Invalid Command" MSG_END);
        break;
    }
}

int main(int argc, char *argv[])
{
    merge(argc, argv);
}