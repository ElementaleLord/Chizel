#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>

// two dots to go up a dir
#include "../include/init_template.h"
#include "../include/chz_constants.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/stat.h>
#include <sys/types.h>
#endif

//~ used to create the blank template of .chz
//$ P: requires additional helper or auxilary functions to do EX: main branch, init commit etc...
bool init()
{
    DIR* p_dir = opendir(CHZ_PATH);
    if(p_dir)
    {
        printf(".chz folder already exists");
        closedir(p_dir);
        return false;
    }

    #ifdef _WIN32

        for(size_t i = 0; i < REPO_TEMPLATE_SIZE; i++)
        {
            const char* data = REPO_TEMPLATE[i].data;
            const char* path = REPO_TEMPLATE[i].path;

            if(data == NULL)
            {
                if(mkdir(path) < 0)
                {
                    printf("INIT ERROR: Failed To Create %s" , path);
                    //? P: should be replaced with something that doesnt just shut down the program
                    exit(EXIT_FAILURE);
                }
            }else
            {
                FILE *pfile = fopen(path,"w");
                if(!pfile)
                {
                    printf("INIT ERROR: Failed To Open %s", path);
                    //? P: should be replaced with something that doesnt just shut down the program
                    exit(EXIT_FAILURE);
                }
                fwrite(data, 1, strlen(data), pfile);
                fclose(pfile);
            }
        }

    #else

        for(size_t i = 0; i < REPO_TEMPLATE_SIZE; i++)
        {
            const char* data = REPO_TEMPLATE[i].data;
            const char* path = REPO_TEMPLATE[i].path;

            if(data == NULL)
            {
                if(mkdir(path, DEF_PERM) < 0)
                {
                    printf("INIT ERROR: Failed To Create %s" , path);
                    //? P: should be replaced with something that doesnt just shut down the program
                    exit(EXIT_FAILURE);
                }
            }else
            {
                FILE *pfile = fopen(path,"w");
                if(!pfile)
                {
                    printf("INIT ERROR: Failed To Open %s", path);
                    //? P: should be replaced with something that doesnt just shut down the program
                    exit(EXIT_FAILURE);
                }
                fwrite(data, 1, strlen(data), pfile);
                fclose(pfile);
            }
        }
    #endif

    return true;
}

int main()
{
    init();
}
