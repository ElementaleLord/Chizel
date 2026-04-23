#include "../include/chizel.c"
#include <dirent.h>
#include <errno.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

typedef struct{
    char *src;
    char *dest;
    char *newer;
}ConflictPair;

typedef struct{
    ConflictPair *pair;
    size_t size;
    size_t capacity;
}ConflictVector;

//*------------------------------------------------------------------------------
//~ used to check the existance of a directory
bool dirExists(const char* path){
    DIR* p_dir = opendir(path);

    if(!p_dir){
        return false;
    }

    closedir(p_dir);
    return true;
}
//*------------------------------------------------------------------------------

//~ copies data from a src file to a target file
bool copyFile(const char* src, const char* dest){
    FILE *fp_src, *fp_dest;
    char buffer[1024];
    size_t bytesRead;

    fp_src = fopen(src, "rb");
    if(!fp_src){
        printf(MERGE_ERROR_MSG_START"Failed To Open Source"MSG_END);
        whatIsTheError();
        return false;
    }

    fp_dest = fopen(dest, "wb");
    if(!fp_dest){
        fclose(fp_src);
        printf(MERGE_ERROR_MSG_START"Failed To Open Destination %s: %s"MSG_END, dest, strerror(errno));
        whatIsTheError();
        return false;
    }

    while((bytesRead = fread(buffer, 1, sizeof(buffer), fp_src)) > 0){
        fwrite(buffer, 1, bytesRead, fp_dest);
    }

    fclose(fp_src);
    fclose(fp_dest);
    return true;
}

//~ used to recurcively combine all files from the source to the destination
bool mergeRec(const char* srcPath, const char* destPath){
    DIR* p_srcDir = opendir(srcPath);
    struct dirent *srcIter;
    struct stat st;
    char fileFromSrc[1024], fileFromDest[1024];

    if(!p_srcDir){
        printf(MERGE_ERROR_MSG_START"Failed To Open Directory %s"MSG_END, srcPath);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    while((srcIter = readdir(p_srcDir)) != NULL){
        if(strcmp(srcIter->d_name, ".") == 0 || strcmp(srcIter->d_name, "..") == 0){
            continue;
        }

        snprintf(fileFromSrc, sizeof(fileFromSrc), "%s/%s", srcPath, srcIter->d_name);
        snprintf(fileFromDest, sizeof(fileFromDest), "%s/%s", destPath, srcIter->d_name);

        if(stat(fileFromSrc, &st) < 0){
            closedir(p_srcDir);
            printf(MERGE_ERROR_MSG_START"Failed To Read From Path %s"MSG_END, fileFromSrc);
            whatIsTheError();
            return false;
        }
        if(!dirExists(fileFromDest)){
        #ifdef _WIN32
            if(mkdir(fileFromDest) < 0)
        #else
            if(mkdir(fileFromDest, DEF_PERM) < 0)
        #endif
            {
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START"Failed To Create Directory %s: %s"MSG_END, fileFromDest, strerror(errno));
                whatIsTheError();
                return false;
            }
        }

        if(S_ISDIR(st.st_mode)){
            if(!mergeRec(fileFromSrc, fileFromDest)){
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START"Failed To Recursively Merge %s and %s"MSG_END, fileFromSrc, fileFromDest);
                whatIsTheError();
                return false;
            }
        }else{
            if(!copyFile(fileFromSrc, fileFromDest)){
                closedir(p_srcDir);
                printf(MERGE_ERROR_MSG_START"Failed To Copy Files from %s to %s"MSG_END, fileFromSrc, fileFromDest);
                whatIsTheError();
                return false;
            }
        }
    }

    closedir(p_srcDir);
    return true;
}

//~ starts the merge <some> checks
bool doMerge(DIR* p_dir, const char* source, const char* target){
    char srcPath[1024], destPath[1024];

//*-------------------------------------------------------------------------------------------
    //? P: maybe pass the full path instead of just the name ?
    //? P: will need to refactor both preDoMerge() and curMerge() if so
    //? P: i think its better to pass path bc i get the full path from HEAD in curMerge()
    //? P: if we do that we just move the snprintf() calls from here to those other functions and change the param names ig
    //^ O: if u deem it better, wait for confirmation from F
//*-------------------------------------------------------------------------------------------

    snprintf(srcPath, sizeof(srcPath), "%s/%s", BRANCHES_PATH, source);
    snprintf(destPath, sizeof(destPath), "%s/%s", BRANCHES_PATH, target);

    if(!dirExists(srcPath)){
        printf(MERGE_ERROR_MSG_START"source %s Does Not Exist."MSG_END, source);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }
    if(!dirExists(destPath)){
        printf(MERGE_ERROR_MSG_START"target %s Does Not Exist."MSG_END, target);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    if(!(mergeRec(srcPath, destPath))){
        printf(MERGE_ERROR_MSG_START"Failed To Merge %s to %s."MSG_END, source, target);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }else{
        printf(MERGE_REPORT_MSG_START"Merged %s to %s successfully."MSG_END, source, target);
        return true;
    }
}


//~ perma copies the string onto another (via heap memory)
char *cloneString(const char *s)
{
    size_t len = strlen(s) + 1;
    char *copy = malloc(len);
    if(copy != NULL)
    {
        memcpy(copy, s, len);
    }
    return copy;
}

//~ vector size check, pair existence check and conflict storing
bool pushConflict(ConflictVector *v, const char *src, const char* dest)
{
    if(v->size == v->capacity)
    {
        size_t newCap = (v->capacity == 0) ? 8 : v->capacity*2;
        ConflictPair *data = realloc(v->pair, newCap * sizeof(ConflictPair));
        if(data == NULL) return false;
        v->pair = data;
        v->capacity = newCap;
    }

    v->pair[v->size].src = cloneString(src);
    v->pair[v->size].dest = cloneString(dest);
    v->pair[v->size].newer = NULL;

    if(v->pair[v->size].src == NULL || v->pair[v->size].dest == NULL){
        free(v->pair[v->size].src);
        free(v->pair[v->size].dest);
        free(v->pair[v->size].newer);
        return false;
    }

    v->size++;
    return true;
}

//~ clears the conflict vector
void clearConflictVector(ConflictVector *vec){
    size_t i;

    for(i=0; i< vec->size; i++){
        free(vec->pair[i].src);
        free(vec->pair[i].dest);
        free(vec->pair[i].newer);
    }
    
    free(vec->pair);
    vec->pair = NULL;
    vec->size = 0;
}

//~ searches destination path for the same name
bool searchSameName(const char* dest, const char fileName, const char *src, ConflictVector *v){
    DIR* dir = opendir(dest);
    struct dirent *entry;
    struct stat st;
    char fullPath[1024];

    if(dir == NULL){
        printf(MERGE_ERROR_MSG_START"Failure whilst openning %s directory"MSG_END, src);
        whatIsTheError();
        return false;
    }

    while((entry = readdir(dir)) != NULL){
        if(strcmp(entry->d_name, ".") != 0 && strcmp(entry->d_name, "..") != 0){
            snprintf(fullPath, sizeof(fullPath), "%s/%s", src, entry->d_name);

            if(stat(fullPath, &st) != 0){
                closedir(dir);
                printf(MERGE_ERROR_MSG_START"Failure whilst reading path %s"MSG_END, fullPath);
                whatIsTheError();
                return false;
            }

            if(S_ISDIR(st.st_mode)){
                if(!searchSameName(fullPath, fileName, src, v)){
                    closedir(dir);
                    return false;
                }
            }else{
                if(strcmp(entry->d_name, fileName) == 0){
                    if(!pushConflict(v, src, fullPath)){
                        closedir(dir);
                        printf(MERGE_ERROR_MSG_START"Failed to store conflict paths"MSG_END);
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
bool collectFileConflicts(const char *src, const char *dest, ConflictVector *conflicts){
    DIR* dir = opendir(src);
    struct dirent *entry;
    struct stat st;
    char fullPath[1024];

    if(dir == NULL){
        printf(MERGE_ERROR_MSG_START"Failure whilst openning %s directory"MSG_END, src);
        whatIsTheError();
        return false;
    }

    while((entry = readdir(dir)) != NULL){
        if(strcmp(entry->d_name, ".") != 0 && strcmp(entry->d_name, "..") != 0){
            snprintf(fullPath, sizeof(fullPath), "%s/%s", src, entry->d_name);

            if(stat(fullPath, &st) != 0){
                closedir(dir);
                printf(MERGE_ERROR_MSG_START"Failure whilst reading path %s"MSG_END, fullPath);
                whatIsTheError();
                return false;
            }

            if(S_ISDIR(st.st_mode)){
                if(!collectFileConflicts(fullPath, dest, conflicts)){
                    closedir(dir);
                    return false;
                }
            }else{
                if(!searchSameName(dest, entry->d_name, fullPath, conflicts)){
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
bool checkFileConflicts(const char* pathSrc, const char* pathDest){
    ConflictVector conflicts;
    struct stat stSrc, stDest;
    size_t i;

    if(!collectFileConflicts(pathSrc, pathDest, &conflicts)){
        freeConflictVector(&conflicts);
        return false;
    }

    for(i = 0; i < conflicts.size; i++){
        if(stat(conflicts.pair[i].src, &stSrc) != 0 || stat(conflicts.pair[i].dest, &stDest) != 0)
        {
            printf(MERGE_ERROR_MSG_START"Failed To Stat Conflict Paths"MSG_END);
            whatIsTheError();
            freeConflictVector(&conflicts);
            return false;
        }

        if(stSrc.st_mtime > stDest.st_mtime) conflicts.pair[i].newer = cloneString(conflicts.pair[i].src);

        else if(stDest.st_mtime > stSrc.st_mtime) conflicts.pair[i].newer = cloneString(conflicts.pair[i].dest);

        else conflicts.pair[i].newer = NULL;

        printf("Conflict:\n");
        printf("-  %s\n", conflicts.pair[i].src);
        printf("-  %s\n", conflicts.pair[i].dest);

        if(conflicts.pair[i].newer != NULL)
        {
            printf("  Newer: %s\n", conflicts.pair[i].newer);
        }else
        {
            printf("  Both have the same modification time\n");
        }
    }

    freeConflictVector(&conflicts);
    return true;
}
/*
* curMerge() should handle the case of if the branches given dont exist
* and i think if the above is done then doMerge() should just get the full paths instead of just the names
*/
//~ used to identify if there is merge conflicts between the two branchs
bool checkMergeConflicts(const char* src, const char* dest)
{
    //omar's idea
    if(strcmp(src, dest) == 0)
    {
        printf(MERGE_ERROR_MSG_START"Cannot Merge A Branch With Itself, what are u trying to do?"MSG_END);
        whatIsTheError();
        return false;
    }

    char pathSrc[1024], pathDest[1024];
    snprintf(pathSrc, sizeof(pathSrc), "%s/%s", BRANCHES_PATH, src);
    if(!dirExists(pathSrc))
    {
        printf(MERGE_ERROR_MSG_START"Branch %s Does Not Exist"MSG_END, src);
        whatIsTheError();
        return false;
    }

    snprintf(pathDest, sizeof(pathDest), "%s/%s", BRANCHES_PATH, dest);
    if(!dirExists(pathDest))
    {
        printf(MERGE_ERROR_MSG_START"Branch %s Does Not Exist"MSG_END, dest);
        whatIsTheError();
        return false;
    }

    //second base case is that the common ancestor commit between target and source is itself source 
    //    //$ the below is probably gonna be a function of its own that this func calls
    //    in which case first call commit to create a merge commit on source 
    //        which will store the fact that there is two prev commits which allows us to differentiate merge commit from normal ones
    //        then overwrite the head of target to be the same as the head of source
    //        because in this case source is technically just a newer version of target
    //        but head of target cant be the same as head of source so maybe make two commits with reversed params
    //        like mergeCommit(src, tar); mergeCommit(tar, src);
    //    //$ the above is probably gonna be a function of its own that this func calls
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
void preDoMerge(DIR* p_dir, const char* source, const char* target){

    if(doMerge(p_dir, source, target))
    {
        printf(MERGE_REPORT_MSG_START"Merge Sucessful"MSG_END);
    }
    else{
        printf(MERGE_ERROR_MSG_START"Failed To Merge %s and %s"MSG_END, source, target);
        whatIsTheError();
    }
}

//~ gets the current branch to use as the target of the merge then calls doMerge
void curMerge(DIR* p_dir, const char* source){
    char path[1024], *token;
    DIR* p_headF= open(HEAD_PATH, "r");

    if (!p_headF){
        printf(MERGE_ERROR_MSG_START"Failed To Open %s"MSG_END, HEAD_PATH);
        whatIsTheError();
    }

    read(p_headF, path, 1024);
    strtok_r(path, " ", &path);
    token= strtok_r(path, " ", &path);
    //$ P: need clearer picture of how cur branch is saved
}

//~ used to display help message replated to merge
void mergeHelp(){
    printf(MERGE_REPORT_MSG_START"\nUsage: chz merge <branch-name>, chz merge <compare-name> <base-name>"MSG_END);
}

//~ handles cases based on arguments to call needed functions
void merge(int argc, char* argv[]){
    DIR* p_dir;

    switch(argc){
        //@ chz merge <arg>
        case (ARG_BASE+ 3):
            if (strcmp(argv[ARG_BASE+ 3], "-h") == 0)
            {//% chz merge -h
                mergeHelp();
            }
            else
            {//% chz merge <branch-name>
                p_dir = checkChz();
                curMerge(p_dir, argv[ARG_BASE+ 3]);
            }
            break;

        //@ chz merge <arg> <arg>
        case (ARG_BASE+ 4):

            {//% chz merge <compare-branch> <base-branch>
            p_dir = checkChz();
            doMerge(p_dir, argv[ARG_BASE+ 3], argv[ARG_BASE+ 4]);
            //& P: the compare branch will be merged into the base branch
            }
            break;

        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
    closedir(p_dir);
}

int main(int argc, char* argv[]){
    merge(argc, argv);
    return 0;
}