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

bool init()
{
    const char* dir = ".chz";
    const short perm = 0700;

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

        for(size_t i = 0; i < REPO_TEMPLATE_SIZE; i++)
        {
            const char* data =  REPO_TEMPLATE[i].data;
            const char* path = REPO_TEMPLATE[i].path;

            if(data == NULL)
            {
                if(mkdir(path,perm) < 0)
                {
                    printf("failed in creating %s" , path);
                    exit(EXIT_FAILURE);
                }
            }else
            {
                FILE *fp = fopen(path,"w");
                if(!fp)
                {
                    printf("failed in opening file %s", path);
                    exit(EXIT_FAILURE);
                }
                fwrite(data, 1, strlen(data), fp);
                fclose(fp);
            }
        }
    #endif

    return true;
}

int main()
{
    init();
}
