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

//~ used to recurcively combine all files from the source to the destination
//^ P: probably gonna be remade as thats not how merge works
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
    
    snprintf(srcPath, sizeof(srcPath), "%s/%s", BRANCHES_PATH, source);
    snprintf(destPath, sizeof(destPath), "%s/%s", BRANCHES_PATH, target);   
    //? O: find a better system??
    //^ P: just reuse functions why define new ones if your already gonna build the path anyway ?
    if(!dirExists(srcPath)){
        printf("MERGE ERROR: source %s Does Not Exist.", source);
        exit(EXIT_FAILURE);
    }
    if(!dirExists(destPath)){
        printf("MERGE ERROR: target %s Does Not Exist.", target);
        exit(EXIT_FAILURE);
    }

    if(!(mergeRec(srcPath, destPath))){
        printf("MERGE ERROR: ");
        exit(EXIT_FAILURE);
    }else{
        printf("Merged %s to %s successfully\n", source, target);
        return true;
    }
}

//~ gets the current branch to use as the target of the merge
bool preMerge(DIR* p_dir, const char* source){
    DIR* p_headF= open(HEAD_PATH, "r");
    char path[1024], *token;
    if (!p_headF){
        printf("MERGE ERROR: Failed To Open %s\n", HEAD_PATH);
    }
    read(p_headF, path, 1024);
    strtok_r(path, " ", &path);
    token= strtok_r(path, " ", &path);
    //$ P: need clearer picture of hwo cur branch is saved
}

//~ handles cases based on arguments to call needed functions
void merge(int argc, char* argv[]){
    DIR* p_dir = opendir(CHZ_PATH);
    if(!p_dir){
        printf("MERGE ERROR: .chz Not Found, Plz Make Sure Your In A CHZ Repository Director Or Run: \"chz init\"");
        return false;
    }

    switch(argc){
        case (ARG_BASE+ 3):
    //@ chz merge <extra arg>
            if (strcmp(argv[ARG_BASE+ 3], "-h") == 0){
                printf("Usage: chz merge <branch-name>, chz merger <compare-name> <base-name>");
            }
            else{
                if (preMerge(p_dir, argv[ARG_BASE+ 3])){
                    printf("Merge Sucessful\n");
                }
                else{
                    printf("MERGE ERROR: Failed To Get Cur Branch.\n");
                }
            }
            break;
        case (ARG_BASE+ 4):
    //@ chz merge <compare-name> <base-name>
            if(doMerge(p_dir, argv[ARG_BASE+ 3], argv[ARG_BASE+ 4])){
                    printf("Merge Sucessful\n");
            }
            else{
                printf("MERGE ERROR: Failed To Recursively Merge %s and %s\n", argv[ARG_BASE+ 3], argv[ARG_BASE+ 4]);
            }
            break;
        default:
            printf("MERGE ERROR: Invalid command.\n");
            break;
    }
    closedir(p_dir);
}

int main(int argc, char* argv[]){
    printf("argc: %i\n", argc);
    int i=0;
    while(argv[i] != NULL){
        printf("argv[%i]: %s\n",i, argv[i]);
        i++;
    }
    merge(argc, argv);
}
