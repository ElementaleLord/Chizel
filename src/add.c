#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include <sys/stat.h>

// two dots to go up a dir
#include "../include/init_template.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/types.h>
#endif

#define ARG_BASE -1
#define STAGING_AREA_PATH ".chz/index"

bool checkStagingArea(){
    FILE* staging_area = fopen(STAGING_AREA_PATH, "r");
    if(staging_area == NULL){
        printf("ERROR opening staging area to check.\n");
        return false;
    }
    char line[1024];
    struct stat st;
    bool all_exist = true;

    while(fgets(line, sizeof(line), staging_area) != NULL){
        line[strcspn(line, "\n")] = '\0';
        if(line[0] == '\0'){
            continue;
        }
        if(stat(line,&st) != 0){
            printf("Missing File: %s\n", line);
            all_exist = false;
        }
    }
    fclose(staging_area);
    return all_exist;
}

FILE* getStagingArea(){
    FILE* staging_area = fopen(STAGING_AREA_PATH, "r");
    if(staging_area == NULL){
        printf("No files in staging area!\n");
        return NULL;
    }
    return staging_area;
}

bool clearStagingArea(){
    FILE* staging_area = fopen(STAGING_AREA_PATH, "w");
    if(staging_area != NULL){
        fclose(staging_area);
        printf("Cleared staging area.\n");
        return true;
    }else{
        return false;
    }
}

bool checkDup(FILE* staging_area, char* file){
    char line[256];
    rewind(staging_area);
    while(fgets(line, sizeof(line), staging_area) != NULL){
        line[strcspn(line, "\n")] = '\0';
        if(strcmp(line, file) == 0){
            return true;
        }
    }
    return false;
}

bool addFunction(char* file, const char* path){
    (void) path;
    FILE* staging_area = fopen(STAGING_AREA_PATH, "a+");
    if(staging_area == NULL){
        printf("ERROR opening staging area\n");
        return false;
    }
    if(checkDup(staging_area, file)){
        // ALREADY IN STAGING AREA
        fclose(staging_area);
        return false;
    }
    fseek(staging_area, 0, SEEK_END);
    fprintf(staging_area, "%s\n", file);
    fclose(staging_area);
    return true;
}

bool addAllFunction(const char* path, int depth){
    FILE* staging_area = fopen(STAGING_AREA_PATH, "a+");
    if(staging_area == NULL){
        printf("ERROR opening staging area\n");
        return false;
    }
    DIR* content = opendir(path);
    struct dirent *recDir;
    struct stat st;
    char fullpath[1024];
    char root_path[1024];
    size_t root_len;

    getcwd(root_path, sizeof(root_path));
    root_len = strlen(root_path);
    
    if(!content)
    {
        printf("Error displaying content");
        exit(EXIT_FAILURE);
    }

    while((recDir = readdir(content)) != NULL)
    {
        if(strcmp(recDir->d_name, ".") == 0 || strcmp(recDir->d_name, "..") == 0)
        {
            continue;
        }

        snprintf(fullpath, sizeof(fullpath), "%s\\%s", path, recDir->d_name);

        if(stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode))
        {
            if(strcmp(recDir->d_name, ".chz") == 0){
                continue;
            }
            addAllFunction(fullpath, depth + 1);
        }else{
            const char* relative_path = fullpath;
            if(strncmp(fullpath, root_path, root_len) == 0 &&
                (fullpath[root_len] == '\\' || fullpath[root_len] == '/')){
                relative_path = fullpath + root_len + 1;
            }
            if(!checkDup(staging_area, (char*) relative_path)){
                fseek(staging_area, 0, SEEK_END);
                fprintf(staging_area, "%s\n", relative_path);
            }
        }
    }
    closedir(content);
    fclose(staging_area);
    return true;    
}

bool checkForFile(char *file){        
    struct stat st;
    return stat(file, &st) == 0 && !S_ISDIR(st.st_mode);
}

void add(int argc, char* argv[]){
    const char* dir = ".chz";
    const short perm = 0700;
    char path[512];
    getcwd(path,512);               // getCurrentWorkingDirectory and put it inside path
    DIR* p_dir = opendir(dir);
    if(!p_dir){
        printf("ERROR, this isn't a .chz repository.\n");
        return;
    }
    switch(argc){
        case(ARG_BASE + 2):    // chz add
            printf("Please specifify the file to add to the staging area.\n");
            break;
        case(ARG_BASE + 3):    // chz add <xxx>
            if(strcmp(argv[ARG_BASE + 2], ".") == 0){
                if(addAllFunction(path, 0)){
                    printf("Successfully added all files to staging area.\n");
                    break;
                }else{
                    break;
                }
            }
            if(strcmp(argv[ARG_BASE + 2], "clear") == 0){
                if(clearStagingArea()){
                    printf("Successfully checked staging area.\n");
                    break;
                }else{
                    printf("ERROR checking staging area.\n");
                    break;
                }
            }
            if(strcmp(argv[ARG_BASE + 2], "check") == 0){
                if(checkStagingArea()){
                    printf("Successfully checked staging area.\n");
                    break;
                }else{
                    printf("ERROR checking staging area.\n");
                    break;
                }
            }
            if(checkForFile(argv[ARG_BASE + 2])){
                if(addFunction(argv[ARG_BASE + 2], path)){
                    printf("Successfully added file to staging area.\n");
                    break;
                }else{
                    printf("ERROR adding file to staging area.\n");
                    break;
                }
            }else{
                printf("File doesnt exist, make sure you input correct file name and format.\n");
                break;
            }
    }
}

int main(int argc, char* argv[]){
    int i=0;
    while(argv[i] != NULL){
        i++;
    }
    add(argc, argv);
    return 0;
}