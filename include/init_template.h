#ifndef INIT_TEMPLATE
#define INIT_TEMPLATE

typedef struct
{
    const char* data;
    size_t count;
    size_t capacity;
}Data;

typedef struct
{
    char* path;
    Data data;
}file;

typedef struct
{
    file* files;
    size_t count;
    size_t capacity;
} Files;

typedef struct
{
    char* dirname;
    int perms;
    char** directories;
    Files files;
}Init_template;

#endif