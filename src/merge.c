#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>

// two dots to go up a dir
#include "../include/init_template.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/stat.h>
#include <sys/types.h>
#endif

#define ARG_BASE -1

bool branchExists(const char* name){
    char path[1024];
    DIR* p_dir;

    snprintf(path, sizeof(path), ".chz/branches/%s", name);
    if(!(p_dir = opendir(path))){
        return false;
    }

    closedir(p_dir);
    return true;
}

bool dirExists(const char* path){
    DIR* p_dir = opendir(path);

    if(!p_dir){
        return false;
    }

    closedir(p_dir);
    return true;
}

bool copyFile(const char* src, const char* dest){
    FILE *fp_src, *fp_dest;
    char buffer[1024];
    size_t bytesRead;

    fp_src = fopen(src, "rb");
    if(!fp_src){
        printf("Failed opening source file %s\n", src);
        return false;
    }

    fp_dest = fopen(dest, "wb");
    if(!fp_dest){
        fclose(fp_src);
        printf("Failed opening destination file %s: %s\n", dest, strerror(errno));
        return false;
    }

    while((bytesRead = fread(buffer, 1, sizeof(buffer), fp_src)) > 0){
        fwrite(buffer, 1, bytesRead, fp_dest);
    }

    fclose(fp_src);
    fclose(fp_dest);
    return true;
}

bool mergeRec(const char* srcPath, const char* destPath){
    DIR* p_dir = opendir(srcPath);
    struct dirent *de;
    struct stat st;
    char src[1024], dest[1024];

    if(!p_dir){
        printf("Directory openning error");
        exit(EXIT_FAILURE);
    }

    while((de = readdir(p_dir)) != NULL){
        if(strcmp(de->d_name, ".") == 0 || strcmp(de->d_name, "..") == 0){
            continue;
        }

        snprintf(src, sizeof(src), "%s/%s", srcPath, de->d_name);
        snprintf(dest, sizeof(dest), "%s/%s", destPath, de->d_name);

        if(stat(src, &st) < 0){
            closedir(p_dir);
            printf("Failed reading path %s\n", src);
            return false;
        }

        if(S_ISDIR(st.st_mode)){
            if(!dirExists(dest)){
#ifdef _WIN32
                if(mkdir(dest) < 0)
#else
                if(mkdir(dest, 0700) < 0)
#endif
                {
                    closedir(p_dir);
                    printf("Failed creating directory %s: %s\n", dest, strerror(errno));
                    return false;
                }
            }

            if(!mergeRec(src, dest)){
                closedir(p_dir);
                return false;
            }
        }else{
            if(!copyFile(src, dest)){
                closedir(p_dir);
                return false;
            }
        }
    }

    closedir(p_dir);
    return true;
}

// starts the merge <some> checks
bool merge(const char* source, const char* target){
    const char* dir = ".chz";   // global var soon
    char srcPath[1024], destPath[1024];
    DIR* p_dir = opendir(dir);

    if(!p_dir){
        printf("Not in a .chz repo, run chz init first\n");
        return false;
    }
    if(!branchExists(source)){
        printf("%s does not exist, unable to merge", source);
        exit(EXIT_FAILURE);
    }
    if(!branchExists(target)){
        printf("%s does not exist, unable to merge", target);
        exit(EXIT_FAILURE);
    }

    snprintf(srcPath, sizeof(srcPath), ".chz/branches/%s", source);
    snprintf(destPath, sizeof(destPath), ".chz/branches/%s", target);   //? find a better system??

    if(!(mergeRec(srcPath, destPath))){
        printf("Merge error");
        exit(EXIT_FAILURE);
    }else{
        printf("Merge success\n");
        return true;
    }
}

int main(int argc, char* argv[]){
    if(argc > 2){
        merge(argv[ARG_BASE + 2], argv[ARG_BASE + 3]);   // chz merge <a> <b>
    }
}
