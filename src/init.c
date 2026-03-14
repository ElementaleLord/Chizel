#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include "include/init_template.h"

//seperate both mdkir commands because function overriding doesnt exist in C
#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/stat.h>
#include <sys/types.h>
#endif

bool init()
{
    const char* dir = ".chz";
    const short perm = 0700;
    const char *directories[] = {"refs", "hooks" , "info", "logs", "objects", "objects/info"};
    const char *files[] = {"HEAD","index", "config", "description.txt", "packed-refs"};

    const char *content[] = {
        "", 
        "", 
        "c1\nc2",
        "desc",
        ""
    };

    DIR* p_dir = opendir(dir);
    if(p_dir)
    {
        printf(".chz folder already exists");
        closedir(p_dir);
        return false;
    }

    #ifdef _WIN32

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
            FILE *fp;
            char path[256];
            snprintf(path, sizeof(path), ".chz/%s", files[i]);
            if((fp = fopen(path, "w")) < 0) 
            {
                printf("fopen failed on: %s", path);
                exit(EXIT_FAILURE);
            }
            if(strcmp(content[i], ""))
            {
                fputs(content[i],fp);
            }
            fclose(fp);
        }

    #else

        if(mkdir(dir, 0755)== -1)
        {
            perror(".chz folder creation error");
            closedir(p_dir);
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
            FILE *fp;
            char path[256];
            snprintf(path, sizeof(path), ".chz/%s", files[i]);
            if((fp = fopen(path, "w")) < 0) 
            {
                printf("fopen failed on: %s", path);
                exit(EXIT_FAILURE);
            }
            if(strcmp(content[i], ""))
            {
                fputs(content[i],fp);
            }
            fclose(fp);
        }

    #endif

    return true;
}

int main()
{
    init();
}