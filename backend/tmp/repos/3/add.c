#include <dirent.h>
#include <sys/stat.h>
#include "../include/chizel.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

//~ checks if the file already exists in the staging area
bool checkDup(FILE* staging_area, char* file){
    char line[256];
    rewind(staging_area);
    while(fgets(line, sizeof(line), staging_area) != NULL){
        line[strcspn(line, "\n")] = '\0';
        //# strcspn returns the index where "\n" first appears in line
        //# meaning that when the line ends inside the file, we end the array that holds these characters
        if(strcmp(line, file) == 0){
            //# strcmp compares line and file and if the there is no diffrence return 0
            return true;
        }
    }
    return false;
}

//~ adds a file to the staging area
bool addFunction(char* file, const char* root_path)
{
    char fullpath[1024];
    const char* relative_path;
    if (file == NULL || file[0] == '\0')
    {
        return false;
    }
    if (strncmp(file, root_path, strlen(root_path)) == 0)
    {
        //# file is a full path (including root)
        relative_path = makeRelativePath(file, root_path);
    }
    else
    {
        //# build fullpath, and then make relative
        snprintf(fullpath, sizeof(fullpath), "%s\\%s", root_path, file);
        relative_path = makeRelativePath(fullpath, root_path);
    }
    FILE* staging_area = fopen(STAGING_AREA_PATH, "a+");
    if (staging_area == NULL)
    {
        printf(ADD_ERROR_MSG_START"Failed To Open Staging Area"MSG_END);
        whatIsTheError();
        return false;
    }
    if (checkDup(staging_area, (char*) relative_path))
    {
        printf(ADD_REPORT_MSG_START"%s Is Already In The Staging Area"MSG_END, relative_path);
        fclose(staging_area);
        return false;
    }
    if (!checkIgnore(file, relative_path))
    {
        printf(ADD_REPORT_MSG_START"%s Is Ignored"MSG_END, relative_path);
        fclose(staging_area);
        return false;
    }
    fseek(staging_area, 0, SEEK_END);
    fprintf(staging_area, "%s\n", relative_path);
    fclose(staging_area);
    return true;
}


//~ adds all files to the staging area
bool addAllFunction(const char* path, int depth)
{
    struct dirent *recDir;
    struct stat st;
    char fullpath[1024], root_path[1024];
    const char* relative_path;
    (void) depth;
    getcwd(root_path, sizeof(root_path));
    FILE* staging_area = fopen(STAGING_AREA_PATH, "a+");
    if (staging_area == NULL)
    {
        printf(ADD_ERROR_MSG_START"Failed To Open Staging Area"MSG_END);
        whatIsTheError();
        return false;
    }
    DIR* content = opendir(path);
    if (!content)
    {
        printf(ADD_ERROR_MSG_START"Failed To Access Directory"MSG_END);
        whatIsTheError();
        fclose(staging_area);
        return false;
    }
    while ((recDir = readdir(content)) != NULL)
    {
        if (strcmp(recDir->d_name, ".") == 0 || strcmp(recDir->d_name, "..") == 0)
        {
            continue;
        }
        snprintf(fullpath, sizeof(fullpath), "%s\\%s", path, recDir->d_name);
        if (stat(fullpath, &st) == 0 && S_ISDIR(st.st_mode))
        {
            relative_path = makeRelativePath(fullpath, root_path);
            if (strcmp(recDir->d_name, ".chz") == 0)
            {
                continue;
            }
            if (!checkIgnore(recDir->d_name, relative_path))
            {
                continue;
            }
            addAllFunction(fullpath, depth + 1);
        }
        else
        {
            relative_path = makeRelativePath(fullpath, root_path);
            if (!checkIgnore(recDir->d_name, relative_path))
            {
                continue;
            }
            if (!checkDup(staging_area, (char*) relative_path))
            {
                fseek(staging_area, 0, SEEK_END);
                fprintf(staging_area, "%s\n", relative_path);
            }
        }
    }
    closedir(content);
    fclose(staging_area);
    return true;
}

//~ checking for .chz before adding all files to the staging area
void preAddAll(char* path)
{
    if (checkChz())
    {
        if(addAllFunction(path, 0))
        {
            printf(ADD_REPORT_MSG_START"Successfully Added All Files To Staging Area"MSG_END);
        }
        else
        {
            printf(ADD_ERROR_MSG_START"Failed To Add All Files To Staging Area"MSG_END);
            whatIsTheError();
        }
    }
}

//~ checking for .chz before adding a file to the staging area
void preAdd(char* filePath, char* path)
{
    if (checkChz())
    {
        if(addFunction(filePath, path))
        {
            printf(ADD_REPORT_MSG_START"Successfully Added File To Staging Area"MSG_END);
        }
        else
        {
            printf(ADD_ERROR_MSG_START"Failed To Add File To Staging Area"MSG_END);
        }
    }
}

//~ helper used to display help menu
void addHelp()
{
    printf(ADD_REPORT_MSG_START"\nUsage: chz add . | chz add <file-name> | chz add -h"MSG_END);
}

//~ main runner function used to determine case and call appropriate function
void add(int argc, char* argv[])
{
    char path[512];

    switch(argc){
        //@ chz add <arg>
        case(ARG_BASE + 3):
            if(strcmp(argv[ARG_BASE + 2], ".") == 0)
            {//% chz add .
                getcwd(path,512);
                preAddAll(path);
            }
            else if(strcmp(argv[ARG_BASE + 2], "-h") == 0)
            {//% chz add -h
                addHelp();
            }
            else
            {//% chz add <file-path>
                getcwd(path,512);
                preAdd(argv[ARG_BASE + 2], path);
            }
            break;
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            break;
    }
}

int main(int argc, char* argv[])
{
    add(argc, argv);
    return 0;
}
