#include <dirent.h>
#include <sys/stat.h>
#include "../include/chizel.c"

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
bool addFunction(char* file, const char* path){
    (void) path;        //# void the path since its the path of the current working directory
    FILE* staging_area = fopen(STAGING_AREA_PATH, "a+");
    if(staging_area == NULL){
        printf(ADD_ERROR_MSG_START"Failed To Open Staging Area"MSG_END);
        whatIsTheError();
        return false;
    }
    if(checkDup(staging_area, file)){
        printf(ADD_REPORT_MSG_START"%s Is In The Staging Area Already"MSG_END, file);
        fclose(staging_area);
        return false;
    }
    fseek(staging_area, 0, SEEK_END);
    fprintf(staging_area, "%s\n", file);
    fclose(staging_area);
    return true;
}

//~ adds all files to the staging area
bool addAllFunction(const char* path, int depth)
{
    struct dirent *recDir;
    struct stat st;
    char fullpath[1024], root_path[1024];
    size_t root_len;
    getcwd(root_path, sizeof(root_path));
    root_len = strlen(root_path);

    FILE* staging_area = fopen(STAGING_AREA_PATH, "a+");
    //# a+ for reading and writing, initial reading pos is at the start, initial writing pos is at the end.
    if(staging_area == NULL)
    {
        printf(ADD_ERROR_MSG_START"Failed To Open Staging Area"MSG_END);
        whatIsTheError();
        return false;
    }
    //# content are the files inside the directory
    DIR* content = opendir(path);
    if(!content)
    {
        printf(ADD_ERROR_MSG_START"Failed To Access Directory"MSG_END);
        whatIsTheError();
        return false;
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
            if(strcmp(recDir->d_name, ".chz") == 0)
            {
                continue;
            }
            addAllFunction(fullpath, depth + 1);
        }else
        {
            const char* relative_path = fullpath;
            //# strncmp compares the characters of fullpath and root_path with a max of root_len characters
            //# for each character, if fullpath's character is bigger than root_path's character, return 1
            //# if smaller, return -1 and if equal return 0, if 0 continue on the next character until root_len compares
            //# here we check if the fullpath (built by going through directories) and root_path (getcwd) are the same
            if(strncmp(fullpath, root_path, root_len) == 0 && (fullpath[root_len] == '\\' || fullpath[root_len] == '/'))
            {
                relative_path = fullpath + root_len + 1;
            }
            if(!checkDup(staging_area, (char*) relative_path))
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