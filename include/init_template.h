#ifndef INIT_TEMPLATE_H
#define INIT_TEMPLATE_H

#include <stddef.h>

typedef struct
{
    const char* path;
    const char* data;
}TemplateValue;

static const TemplateValue REPO_TEMPLATE[] = {

    {".chz", NULL },
    {".chz/refs", NULL},
    {".chz/refs/heads", NULL},
    {".chz/refs/tags", NULL},
    {".chz/objects", NULL},
    {".chz/objects/info", NULL},
    {".chz/hooks", NULL},
    {".chz/info", NULL},
    {".chz/HEAD", "ref: refs/heads/main\n"},
    {".chz/index", ""},
    {".chz/config", "[core]\n\trepositoryformatversion = 0\n"},
    {".chz/description", "Unnamed repository\n"},
    {".chz/unpacked-refs", ""},
};

static const size_t REPO_TEMPLATE_SIZE = sizeof(REPO_TEMPLATE)/sizeof(REPO_TEMPLATE[0]);
#endif
