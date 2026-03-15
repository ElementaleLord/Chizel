#ifndef INIT_TEMPLATE_H
#define INIT_TEMPLATE_H

#include <stddef.h>
#include "chz_constants.h"

//~ file and content pair
typedef struct
{
    const char* path;
    const char* data;
}TemplateValue;

//~ .chz dir template
static const TemplateValue REPO_TEMPLATE[] =
{
    {CHZ_PATH,              NULL },
    {REFS_PATH,             NULL},
    {REFS_HEADS_PATH,       NULL},
    {REFS_TAGS_PATH,        NULL},
    {OBJECTS_PATH,          NULL},
    {OBJECTS_INFO_PATH,     NULL},
    {HOOKS_PATH,            NULL},
    {INFO_PATH,             NULL},
    {HEAD_PATH,             "ref: refs/heads/main\n"},
    {INDEX_PATH,            ""},
    {CONFIG_PATH,           "[core]\n\trepositoryformatversion = 0\n"},
    {DESC_PATH,             "Unnamed repository\n"},
    {UNPACK_REFS_PATH,      ""},
};

static const size_t REPO_TEMPLATE_SIZE = sizeof(REPO_TEMPLATE)/sizeof(REPO_TEMPLATE[0]);
#endif
