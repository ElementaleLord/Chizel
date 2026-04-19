#include "../include/chizel.h"
#include "../include/chzdb.h"
#include <dirent.h>

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

//~ fetch a repository from the database
bool fetchFromDB(char* link)
{
    return restoreFromDB(link);
}

//~ checks for the repository's origin before fetching
bool checkOrigin(char* link)
{
    DIR* p_dir = opendir(CHZ_PATH);
    if(!checkChz()){
        printf(FETCH_ERROR_MSG_START"Not in a .chz directory"MSG_END);
        whatIsTheError();
        return false;
    }
    FILE *file = fopen(ORIGIN_FILE,"r");
    if(file == NULL)
    {
        printf(FETCH_ERROR_MSG_START"Repository Origin Not Found"MSG_END);
        whatIsTheError();
        return false;
    }

    if(link == NULL)
    {
        // check if origin exists
        char line[256];
        rewind(file);
        fgets(line,sizeof(line),file);
        if(line[0] == '\0')
        {
            // NO ORIGIN
            printf(FETCH_ERROR_MSG_START"Repository Doesn't Have An Origin"MSG_END);
            whatIsTheError();
            return false;
        }
        // ORIGIN EXISTS so returns true
        return true;
    }else{
        // compare file content with the argument
        char line[256];
        rewind(file);
        fgets(line,sizeof(line),file);
        line[strcspn(line, "\n")] = '\0';
        if(strcmp(line,link) == 0){
            return true;
        }else{
            return false;
        }
    }
    fclose(file);
}

//~ checks if the repository has an origin before fetching
bool checkOriginURL(char* originCheck)
{
    if(checkChz())
    {
        //check if origin = link
        if(checkOrigin(originCheck)){
            return true;
        }else{
            printf(FETCH_ERROR_MSG_START"Can't perform action in a .chz directory"MSG_END);
            whatIsTheError();
            return false;
        }
    }
    FILE *file;
    char origin[256];

    if (originCheck == NULL || originCheck[0] == '\0') 
    {
        printf(FETCH_ERROR_MSG_START"Invalid Origin"MSG_END);
        whatIsTheError();
        return false;
    }

    file = fopen(ORIGIN_FILE, "rw");
    if (file == NULL) 
    {
        printf(FETCH_ERROR_MSG_START"Can Not Open Repository Origin"MSG_END);
        whatIsTheError();
        return false;    
    }

    if (fgets(origin, sizeof(origin), file) == NULL) 
    {
        clearerr(file);
        origin[0] = '\0';
    }
    else 
    {
        origin[strcspn(origin, "\r\n")] = '\0';
    }

    if(origin[0] == '\0')
    {
        rewind(file);
        if (fprintf(file, "%s\n", originCheck) < 0) 
        {
            fclose(file);
            return false;
        }
        fflush(file);
        fclose(file);
        return true;
    }

    if(strcmp(origin, originCheck) == 0)
    {
        fclose(file);
        return true;
    }

    printf(FETCH_REPORT_MSG_START"Repository Origin %s Already Exists"MSG_END, origin);
    printf(FETCH_ERROR_MSG_START"Can Not Overwrite Default Origin"MSG_END);
    whatIsTheError();
    fclose(file);
    return false;
}

//~ fetchs data from the database
bool fetchFunction(char* link)
{
    if (link == NULL || link[0] == '\0') 
    {
        printf(FETCH_ERROR_MSG_START"Invalid Link, Origin Is Empty"MSG_END);
        whatIsTheError();
        return NULL;
    }

    char* p = strstr(link,"chizel.com/");
    bool status;
    if(p == link)
    {
        if((status = fetchFromDB(link)))
        {
            printf(FETCH_REPORT_MSG_START"Successfully Fetched From Remote"MSG_END);
        }
        else
        {
            printf(FETCH_ERROR_MSG_START"Can Not Fetch From Remote"MSG_END);
        }
        return status;
    }
    else
    {
        printf(FETCH_ERROR_MSG_START"Invalid link, make sure repository is from Chizel"MSG_END);
        return false;
    }
}

//~ main runner function used to determine case and call appropriate function
bool fetch(int argc, char* argv[])
{
    
    switch(argc)
    {
        //@ chz fetch
        case(ARG_BASE + 2):    
            //% chz fetch
            if(checkOrigin(NULL))
            {
                FILE *file = fopen(ORIGIN_FILE,"r");
                if(file == NULL)
                {
                    printf(FETCH_ERROR_MSG_START"ERROR OPENING ORIGIN FILE"MSG_END);
                    whatIsTheError();
                    return NULL;
                    break;
                }
                char origin[256];
                rewind(file);
                fgets(origin, sizeof(origin), file);
                fclose(file);
                return fetchFunction(origin);
            }
            else
            {
                printf(FETCH_ERROR_MSG_START"This Repository Does Not Have An Origin"MSG_END);
                whatIsTheError();
                printf(FETCH_REPORT_MSG_START"Please Insert An Origin Via Remote Repository HTTPS"MSG_END);
                return false;
            }
            break;
        //@ chz fetch <arg>
        case(ARG_BASE + 3):    
            //% chz fetch <link>
            if(checkOriginURL(argv[ARG_BASE + 2]))
            {
                return fetchFunction(argv[ARG_BASE + 2]);
            }
            break;
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            return false;
            break;
    }
}

/*
int main(int argc, char* argv[])
{
    fetch(argc, argv);
    return 0;
}
*/