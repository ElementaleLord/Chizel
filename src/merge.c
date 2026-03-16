#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <sys/stat.h>
#include <string.h>

//# two dots to go up a dir
#include "../include/init_template.h"
#include "../include/chz_constants.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/types.h>
#endif

//~ used to display the string representation of the error number
void whatIsTheError(){
    printf("Error String: %s.\n", strerror(errno));
}

//~ used to check the existence of the .chz directory
DIR* checkChz(){
    DIR* p_dir = opendir(CHZ_PATH);
    if(!p_dir){
        printf("MERGE ERROR: .chz Not Found, Plz Make Sure Your In A CHZ Repository Director Or Run: \"chz init\"");

        exit(EXIT_FAILURE);
    }
}

//~ used to check the existance of a directory
bool dirExists(const char* path){
    DIR* p_dir = opendir(path);

    if(!p_dir){
        return false;
    }

    closedir(p_dir);
    return true;
}

//~ copies data from a src file to a target file
bool copyFile(const char* src, const char* dest){
    FILE *fp_src, *fp_dest;
    char buffer[1024];
    size_t bytesRead;

    fp_src = fopen(src, "rb");
    if(!fp_src){
        printf("MERGE ERROR: Failed To Open Source %s\n", src);
        return false;
    }

    fp_dest = fopen(dest, "wb");
    if(!fp_dest){
        fclose(fp_src);
        printf("MERGE ERROR: Failed To Open Destination %s: %s\n", dest, strerror(errno));
        return false;
    }

    while((bytesRead = fread(buffer, 1, sizeof(buffer), fp_src)) > 0){
        fwrite(buffer, 1, bytesRead, fp_dest);
    }

    fclose(fp_src);
    fclose(fp_dest);
    return true;
}

//^ P: mergeRec() probably gonna be remade as thats not how merge works
//^ O: i made what "merge" sounded like, dont actually know what it does, but this could be useful
//*-------------------------------------------------------------------------------------------
//^ P: needs a few check before but depending on how F: stores the commits it could be
//*-------------------------------------------------------------------------------------------

//~ used to recurcively combine all files from the source to the destination
bool mergeRec(const char* srcPath, const char* destPath){
    DIR* p_srcDir = opendir(srcPath);
    struct dirent *srcIter;
    struct stat st;
    char fileFromSrc[1024], fileFromDest[1024];

    if(!p_srcDir){
        printf("MERGE ERROR: Failed To Open Directory %s\n", srcPath);
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
            printf("MERGE ERROR: Failed To Read From Path %s\n", fileFromSrc);
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
                printf("MERGE ERROR: Failed To Create Directory %s: %s\n", fileFromDest, strerror(errno));
                return false;
            }
        }

        if(S_ISDIR(st.st_mode)){
            if(!mergeRec(fileFromSrc, fileFromDest)){
                closedir(p_srcDir);
                printf("MERGE ERROR: Failed To Recursively Merge %s and %s\n", fileFromSrc, fileFromDest);
                return false;
            }
        }else{
            if(!copyFile(fileFromSrc, fileFromDest)){
                closedir(p_srcDir);
                printf("MERGE ERROR: Failed To Copy Files from %s to %s\n", fileFromSrc, fileFromDest);
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
//*-------------------------------------------------------------------------------------------

    snprintf(srcPath, sizeof(srcPath), "%s/%s", BRANCHES_PATH, source);
    snprintf(destPath, sizeof(destPath), "%s/%s", BRANCHES_PATH, target);

    if(!dirExists(srcPath)){
        printf("MERGE ERROR: source %s Does Not Exist.\n", source);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }
    if(!dirExists(destPath)){
        printf("MERGE ERROR: target %s Does Not Exist.\n", target);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }

    if(!(mergeRec(srcPath, destPath))){
        printf("MERGE ERROR: Failed To Merge %s to %s.\n", source, target);
        whatIsTheError();
        exit(EXIT_FAILURE);
    }else{
        printf("MERGE REPORT: Merged %s to %s successfully.\n", source, target);
        return true;
    }
}

//~ used to identify if there is merge conflicts between the two branchs
/*
* preDoMerge() and curMerge() should handle the case of if the branches given dont exist
* and i think if the above is done then doMerge() should just get the full paths instead of just the names

first base case is that the target and source are the same branch so exit early while printing msg for why

second base case is that the common ancestor commit between target and source is itself source 
    //$ the below is probably gonna be a function of its own that this func calls
    in which case first call commit to create a merge commit on source 
        which will store the fact that there is two prev commits which allows us to differentiate merge commit from normal ones
        then overwrite the head of target to be the same as the head of source
        because in this case source is technically just a newer version of target
	    but head of target cant be the same as head of source so maybe make two commits with reversed params
	    like mergeCommit(src, tar); mergeCommit(tar, src);
    //$ the above is probably gonna be a function of its own that this func calls

loop call
    we check each file in both source and target branches (recursively probably) then determine (somehow)
    if they have been changed (maybe compare to last commit version ?) if so and the same file is changed in both 
    log that file name for later
loop exit;

check if any file was logged as conflicted
    if so then display "MERGE ERROR: Failed To Merge Due To File Conflicts" 
        and then list all the files that have been logged as conflicted then exit() 
    else then we call doMerge to begin merging source to target (probably through that same merge commit mentioned before)

^ P: hmm tho like mentioned above if there is a mergeCommit() and we store the commit IN the branch Dir itself
^ P: that would mean we now either have two commits practically holding the same data or one branch head is referencing
^ P: a commit outside its own branch Dir >:/
? P: or this implies that doMerge() needs to be changed far more than just a param switch\

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
        printf("Merge Sucessful\n");
    }
    else{
        printf("MERGE ERROR: Failed To Merge %s and %s.\n", source, target);
    }
}

//~ gets the current branch to use as the target of the merge then calls doMerge
void curMerge(DIR* p_dir, const char* source){
    char path[1024], *token;
    DIR* p_headF= open(HEAD_PATH, "r");

    if (!p_headF){
        printf("MERGE ERROR: Failed To Open %s\n", HEAD_PATH);
    }

    read(p_headF, path, 1024);
    strtok_r(path, " ", &path);
    token= strtok_r(path, " ", &path);
    //$ P: need clearer picture of how cur branch is saved
    //? O: what is this supposed to do?
//*-------------------------------------------------------------------------------------------
    //^ P: tokenize the string in HEAD then try to get the path to the current head
    //^ P: commit of the current branch while also getting the name of that branch
//*-------------------------------------------------------------------------------------------
}

//~ used to display help message replated to merge
void mergeHelp(){
    printf("Usage: chz merge <branch-name>, chz merge <compare-name> <base-name>\n");
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
            printf("MERGE ERROR: Invalid Command.\n");
            break;
    }
    closedir(p_dir);
}

int main(int argc, char* argv[]){
    merge(argc, argv);
}
