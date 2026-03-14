#ifndef INIT_TEMPLATE
#define INIT_TEMPLATE

#include <stddef.h>

typedef struct
{
    const char* path;
    const char* data;
}TemplateValue;

const TemplateValue REPO_TEMPLATE[] = {

    {".chz", NULL },
    {".chz/refs", NULL}
};

#endif
