#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>

//seperate both mdkir commands because function overriding doesnt exist in C
#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/stat.h>
#include <sys/types.h>
#endif

bool init(){

    const char* dir = ".chz";
    const short perm = 0700;
    const char *directories[] = {"refs", "hooks" , "info", "logs", "objects", "objects/info"};
    const char *files[] = {"HEAD","index", "config", "description", "packed-refs"};

    #ifdef _WIN32

        DIR* dir = opendir(dir);
        if(dir)
        {
            printf(".chz folder already exists")
            colsedir(dir);
            return false;
        }

        if(mkdir(dir) == -1)
        {
          printf("mkdir %s, failed",dir);
          exit(EXIT_FAILURE);
        }

        size_t size = sizeof(directories) / sizeof(directories[0]);

        for(size_t i = 0; i < size; i++)
        {
            char path[256];
            snprintf(path, sizeof(path), ".chz/%s", directories[i]);
            if(mkdir(path) < 0) 
            {
                printf("mkdir failed on: %s", path);
                exit(EXIT_FAILURE);
            }
        }

        size = sizeof(files) / sizeof(files[0]);

        for(size_t i = 0; i < size; i++)
        {
            char path[256];
            snprintf(path, sizeof(path), ".chz/%s", files[i]);
            if(fopen(path, "w") < 0) 
            {
                printf("fopen failed on: %s", path);
                exit(EXIT_FAILURE);
            }
        }

    #else
        
        DIR *dr = opendir(dir);
        if(dr)
        {
            perror(".chz folder exits");
            closedir(dr);
            return false;
        }

        if(mkdir(dir, 0755)== -1)
        {
            perror(".chz folder creation error");
            closedir(dr);
            return false;
        }
        size_t size = sizeof(directories) / sizeof(directories[0]);

        for(size_t i = 0; i < size; i++)
        {
            char path[256];
            snprintf(path, sizeof(path), ".chz/%s", directories[i]);
            if(mkdir(path, perm) < 0) 
            {
                printf("mkdir failed on: %s", path);
                exit(EXIT_FAILURE);
            }
        }

        size = sizeof(files) / sizeof(files[0]);

        for(size_t i = 0; i < size; i++)
        {
            char path[256];
            snprintf(path, sizeof(path), ".chz/%s", files[i]);
            if(fopen(path, "w") < 0) 
            {
                printf("fopen failed on: %s", path);
                exit(EXIT_FAILURE);
            }
        }

    #endif

    return true;
}

int main(){
    init();
}