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

//~ helper used to print a string representation of the current error number
void whatIsTheError(){
    printf("Error String: %s.\n", strerror(errno));
}

//~ helper used to check if .chz exists
bool checkChz(){
    DIR* p_dir = opendir(CHZ_PATH);
    
    if(p_dir)
    {
        printf("INIT REPORT: .chz Directory Already Exists.\n");
        whatIsTheError();
        closedir(p_dir);
        return false;
    }
    
    return true;
}
//~ used to create .chz directory from a saved template
bool createChz(){
    #ifdef _WIN32

        for(size_t i = 0; i < REPO_TEMPLATE_SIZE; i++)
        {
            const char* data = REPO_TEMPLATE[i].data;
            const char* path = REPO_TEMPLATE[i].path;

            if(data == NULL)
            {
                if(mkdir(path) < 0)
                {
                    printf("INIT ERROR: Failed To Create %s.\n" , path);
                    whatIsTheError();
                    return false;
                }
            }else
            {
                FILE *pfile = fopen(path,"w");
                if(!pfile)
                {
                    printf("INIT ERROR: Failed To Open %s.\n", path);
                    whatIsTheError();
                    return false;
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
                    printf("INIT ERROR: Failed To Create %s.\n" , path);
                    whatIsTheError();
                    return false;
                }
            }else
            {
                FILE *pfile = fopen(path,"w");
                if(!pfile)
                {
                    printf("INIT ERROR: Failed To Open %s.\n", path);
                    whatIsTheError();
                    return false;
                }
                fwrite(data, 1, strlen(data), pfile);
                fclose(pfile);
            }
        }
    #endif
}

//~ helper used to do preliminary checks before calling createChz()
void preCreateChz(){
    if (createChz())
    {
        printf("INIT REPORT: Sucessfully Created .chz.\n");
    }
    else
    {
        printf("INIT ERROR: Failed To Create .chz.\n");
        whatIsTheError();
    }
}


//~ used to print help message
void initHelp(){
    printf("INIT REPORT:\nusage: git init | git init -h\n");
}

//~ main init func used to filter throught cases and call appropriate functions
void init(int argc, char* argv[])
{//$ P: requires additional helper or auxilary functions to do EX: main branch, init commit etc...
    switch(argc){
        //@ chx init
        case ARG_BASE + 2:
            //% chz init
            if (checkChz()) preCreateChz();
            break;
        //@ chz init <arg>
        case ARG_BASE + 3:
            if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz init -h
                initHelp();
            }
            break;
        default:
            break;
    }
}

int main(int argc, char* argv[])
{
    init(argc, argv);
}
