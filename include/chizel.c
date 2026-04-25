#include "chizel.h"
#include <ctype.h>
#include <errno.h>
#include <dirent.h>

//& General
int max(int a, int b) { return (a > b) ? a : b; }

int isDir(const char *path)
{
    struct stat st;
    if (stat(path, &st) == -1)
        return 0;
    return S_ISDIR(st.st_mode);
}

int isBinary(const char *path)
{
    FILE *f = fopen(path, "rb");
    if (!f)
        return -1;

    unsigned char buffer[4096];
    size_t n = fread(buffer, 1, sizeof(buffer), f);
    fclose(f);

    if (n == 0)
        return 0; // empty file => treat as text

    size_t nonprintable = 0;

    for (size_t i = 0; i < n; i++)
    {
        if (buffer[i] == 0)
            return 1; // null byte => binary

        if (!isprint(buffer[i]) && !isspace(buffer[i]))
            nonprintable++;
    }

    // if too many weird chars => binary
    return (nonprintable > n * 0.3);
}

//~ Reverses a string, log reads from end to beginning of line
void reverseString(char *s)
{
    size_t len = strlen(s);

    for (size_t i = 0; i < len / 2; i++)
    {
        char tmp = s[i];
        s[i] = s[len - i - 1];
        s[len - i - 1] = tmp;
    }
}

//~ helper used to print a string representation of the current error number
void whatIsTheError()
{
    printf("Error String: %s.\n", strerror(errno));
}

//~ used to check the existance of a directory
bool dirExists(const char *path)
{
    DIR *p_dir = opendir(path);

    if (!p_dir)
    {
        return false;
    }

    closedir(p_dir);
    return true;
}

//~ Checks if a branch exists
bool branchExists(char *branch)
{
    struct dirent *curDir;
    struct stat st;
    DIR *branches = opendir(BRANCHES_PATH);

    while ((curDir = readdir(branches)) != NULL)
    {
        if (strcmp(curDir->d_name, ".") != 0 && strcmp(curDir->d_name, "..") != 0)
        {
            if (strcmp(curDir->d_name, branch) == 0)
            {
                return true;
            }
        }
    }

    return false;
}

//~ Returns the head
char *getHead()
{
    static char head[256];
    FILE *f = fopen(HEAD_PATH, "r");
    if (!f)
    {
        printf(CHZ_ERROR_MSG_START "Error opening HEAD" MSG_END);
        return NULL;
    }

    if (fgets(head, sizeof(head), f) == NULL)
    {
        printf(CHZ_ERROR_MSG_START "Error reading HEAD" MSG_END);
        return NULL;
    }
    fclose(f);

    head[strcspn(head, "\n")] = '\0'; // replace newline
    char *prefix = "refs/heads/";

    if (strncmp(head, prefix, strlen(prefix)) == 0)
    {
        memmove(head, head + strlen(prefix), strlen(head + strlen(prefix)) + 1);
    }

    return head;
}

//~ Returns the hash pointed to by specified branch
char *getLatestHash(char *branch)
{
    char path[1024];
    static char hash[41];

    snprintf(path, sizeof(path), "%s/%s", REFS_HEADS_PATH, branch);

    FILE *f = fopen(path, "r");
    if (!f)
    {
        printf(CHZ_ERROR_MSG_START "Error opening reference head" MSG_END);
        return NULL;
    }

    if (fgets(hash, sizeof(hash), f) == NULL)
    {
        printf(CHZ_ERROR_MSG_START "Error reading hash" MSG_END);
        fclose(f);
        return NULL;
    }
    fclose(f);

    hash[strcspn(hash, "\n")] = '\0';
    hash[40] = '\0';

    return hash;
}

//~ helper used to check if .chz exists
int checkChz()
{
    DIR *pdir = opendir(CHZ_PATH);
    if (pdir)
    {
        closedir(pdir);
        return 1;
    }
    // # file doesnt exist
    if (errno == ENOENT)
        return 0;
    // # permission error or other issues
    return -1;
}

bool checkForFile(char *file)
{
    struct stat st;
    return stat(file, &st) == 0 && !S_ISDIR(st.st_mode);
}
//& General

//& .chzignore
//~ make relative path from full path and root path (getcwd)
const char *makeRelativePath(const char *fullpath, const char *root_path)
{
    size_t root_len = strlen(root_path);
    // # strncmp compares the characters of fullpath and root_path with a max of root_len characters
    // # for each character, if fullpath's character is bigger than root_path's character, return 1
    // # if smaller, return -1 and if equal return 0, if 0 continue on the next character until root_len compares
    // # here we check if the fullpath (built by going through directories) and root_path (getcwd) are the same
    if (strncmp(fullpath, root_path, root_len) == 0 &&
        (fullpath[root_len] == '\\' || fullpath[root_len] == '/'))
    {
        return fullpath + root_len + 1;
    }
    return fullpath;
}

//~ checks if the file is ignored using its name, extension or relative path, TRUE = NOT IGNORED CZ IM A DUMBASS
bool checkIgnore(char *file, const char *relative_path)
{
    if (relative_path == NULL || relative_path[0] == '\0')
    {
        // # No parameter
        return false;
    }

    FILE *ignoreFile = fopen(IGNORE_FILE, "r");
    if (ignoreFile == NULL)
    {
        // # no ignores to check
        return true;
    }
    char line[256];
    while (fgets(line, sizeof(line), ignoreFile) != NULL)
    {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0')
        {
            // # empty line
            continue;
        }
        if (strcmp(line, file) == 0)
        {
            // # file name found, ignored
            fclose(ignoreFile);
            return false;
        }
        if (strcmp(line, relative_path) == 0)
        {
            // # path found, ignored
            fclose(ignoreFile);
            return false;
        }
        // # example: *.exe
        if (line[0] == '*' && line[1] == '.')
        {
            // # getting the last occurence of "." inside the line to determine the extension of the files that need to be ignored
            // # then get the extension, compare with the -size of the extension and see if the file has same extention
            const char *index = strrchr(file, '.');
            if (index != NULL && strcmp(index, line + 1) == 0)
            {
                // # same extension
                fclose(ignoreFile);
                return false;
            }
        }
        size_t len = strlen(line);
        if (len > 0 && line[len - 1] == '/')
        {
            if (strncmp(relative_path, line, len) == 0)
            {
                // # same relative path
                fclose(ignoreFile);
                return false;
            }
        }
    }
    fclose(ignoreFile);
    return true;
}
//& .chzignore

//& LCS
void dynamic_append(Lines *arr, char *line)
{
    if (arr->capacity == 0)
    {
        arr->capacity = 8;
        arr->content = malloc(arr->capacity * sizeof(char *));
    }
    else if (arr->size >= arr->capacity)
    {
        arr->capacity *= 2;
        arr->content = realloc(arr->content, arr->capacity * sizeof(char *));
    }

    arr->content[arr->size++] = line;
}

Lines read_file(FILE *f)
{
    Lines result = {0};
    char line[1024];
    while (fgets(line, sizeof(line), f))
    {
        line[strcspn(line, "\n")] = 0; // remove \n for better formatting
        dynamic_append(&result, strdup(line));
    }

    return result;
}

void lcs_backtrack(Lines new_file, Lines old_file, int lcs_table[old_file.size + 1][new_file.size + 1], size_t i, size_t j, Lines *out)
{
    if (i > 0 && j > 0 && strcmp(old_file.content[i - 1], new_file.content[j - 1]) == 0)
    {
        lcs_backtrack(new_file, old_file, lcs_table, i - 1, j - 1, out);
        // dynamic_append(out, strdup(old_file.content[i-1]));
    }
    else if (j > 0 && (i == 0 || lcs_table[i][j - 1] >= lcs_table[i - 1][j]))
    {
        lcs_backtrack(new_file, old_file, lcs_table, i, j - 1, out);

        char *line = malloc(strlen(new_file.content[j - 1]) + 32);
        sprintf(line, "%zu + %s\n", j, new_file.content[j - 1]);
        dynamic_append(out, line);
    }
    else if (i > 0)
    {
        lcs_backtrack(new_file, old_file, lcs_table, i - 1, j, out);

        char *line = malloc(strlen(old_file.content[i - 1]) + 32);
        sprintf(line, "%zu - %s\n", i, old_file.content[i - 1]);
        dynamic_append(out, line);
    }
}

int lcs(Lines new_file, Lines old_file, Lines *out)
{
    int n = old_file.size;
    int m = new_file.size;
    int lcs_table[n + 1][m + 1];

    // # lcs of first file vs line 0 of new file
    for (int i = 0; i <= n; i++)
    {
        lcs_table[i][0] = 0;
    }

    // # lcs of new file vs line 0 of old file
    for (int j = 0; j <= m; j++)
    {
        lcs_table[0][j] = 0;
    }

    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
        {
            if (strcmp(old_file.content[i - 1], new_file.content[j - 1]) == 0)
                lcs_table[i][j] = lcs_table[i - 1][j - 1] + 1;
            else
                lcs_table[i][j] = max(lcs_table[i - 1][j], lcs_table[i][j - 1]);
        }
    }

    lcs_backtrack(new_file, old_file, lcs_table, n, m, out);

    return lcs_table[n][m];
}
//& LCS