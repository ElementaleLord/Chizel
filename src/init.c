#include "../include/headers/init.h"
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

//~ used to create .chz directory from a saved template
bool createChz()
{
#ifdef _WIN32

    for (size_t i = 0; i < REPO_TEMPLATE_SIZE; i++)
    {
        const char *data = REPO_TEMPLATE[i].data;
        const char *path = REPO_TEMPLATE[i].path;

        if (data == NULL)
        {
            if (mkdir(path) < 0)
            {
                printf(INIT_ERROR_MSG_START "Failed To Create %s" MSG_END, path);
                whatIsTheError();
                return false;
            }
        }
        else
        {
            FILE *pfile = fopen(path, "w");
            if (!pfile)
            {
                printf(INIT_ERROR_MSG_START "Failed To Open %s" MSG_END, path);
                whatIsTheError();
                return false;
            }
            fwrite(data, 1, strlen(data), pfile);
            fclose(pfile);
        }
    }

#else

    for (size_t i = 0; i < REPO_TEMPLATE_SIZE; i++)
    {
        const char *data = REPO_TEMPLATE[i].data;
        const char *path = REPO_TEMPLATE[i].path;

        if (data == NULL)
        {
            if (mkdir(path, DEF_PERM) < 0)
            {
                printf(INIT_ERROR_MSG_START "Failed To Create %s" MSG_END, path);
                whatIsTheError();
                return false;
            }
        }
        else
        {
            FILE *pfile = fopen(path, "w");
            if (!pfile)
            {
                printf(INIT_ERROR_MSG_START "Failed To Open %s" MSG_END, path);
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
void preCreateChz()
{
    if (createChz())
    {
        printf(INIT_REPORT_MSG_START "Sucessfully Created .chz" MSG_END);
    }
    else
    {
        printf(INIT_ERROR_MSG_START "Failed To Create .chz" MSG_END);
        whatIsTheError();
    }
}

//~ used to print help message
void initHelp()
{
    printf(INIT_REPORT_MSG_START "\nUsage: chz init | chz init -h" MSG_END);
}

//~ main init func used to filter throught cases and call appropriate functions
void init(int argc, char *argv[])
{
    switch (argc)
    {
    //@ chx init
    case ARG_BASE + 2:
        //% chz init
        if (checkChz())
            preCreateChz();
        break;
    //@ chz init <arg>
    case ARG_BASE + 3:
        if (strcmp(argv[ARG_BASE + 2], "-h") == 0)
        { //% chz init -h
            initHelp();
        }
        break;
    default:
        printf(CHZ_ERROR_MSG_START "Invalid Command" MSG_END);
        break;
    }
}