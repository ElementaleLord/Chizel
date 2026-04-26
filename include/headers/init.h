#include "../chizel.h"

#ifndef INIT_H
#define INIT_H

    void init(int argc, char *argv[]);

    void preCreateChz();
    bool createChz();

    typedef struct
    {
        const char *path;
        const char *data;
    } TemplateValue;

    static const TemplateValue REPO_TEMPLATE[] =
        {
            {CHZ_PATH, NULL},
            {REFS_PATH, NULL},
            {REFS_HEADS_PATH, NULL},
            {REFS_TAGS_PATH, NULL},
            {OBJECTS_PATH, NULL},
            {PACK_PUSH_PATH, NULL},
            {PACK_PULL_PATH, NULL},
            {LOGS_PATH, NULL},
            {DATA_PATH, NULL},
            {TAGS_DATA_PATH, NULL},
            {HEAD_PATH, "refs/heads/main\n"},
            {INDEX_PATH, ""},
            {CONFIG_PATH, "[core]\n\trepositoryformatversion = 0\n"},
            {DESC_PATH, "Unnamed repository\n"},
            {".chz/refs/heads/main", "0000000000000000000000000000000000000000\n"},
            {".chz/logs/main.log", ""},
            {".chz/data/main", NULL}
        };

    static const size_t REPO_TEMPLATE_SIZE = sizeof(REPO_TEMPLATE) / sizeof(REPO_TEMPLATE[0]);

#endif