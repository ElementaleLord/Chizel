//~ Functions Explanations
//! Extremely Important Comments
//@ Distinctions
//# Explanations
//$ Tasks
//% Minor Statements
//? Questions
//^ Responses
//& Notes
//* Changes
/// Valuable Redacted Comments


#include <time.h>           //# header...
#include <stddef.h>
#include <string.h>         //# all files...
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/stat.h>

#ifndef CHIZEL_H
#define CHIZEL_H

    //& LCS Algorithm
    typedef struct
    {
        char **content;
        size_t capacity;
        size_t size;
    } Lines;

    int lcs(Lines new_file, Lines old_file, Lines *output);
    Lines read_file(FILE *f);
    void dynamic_append(Lines *arr, char *line);



    //& General
    //~ Paths
    #define CHZ_PATH ".chz"
    #define BRANCHES_PATH ".chz/refs/heads/"
    #define REFS_PATH ".chz/refs"
    #define REFS_HEADS_PATH ".chz/refs/heads"
    #define REFS_TAGS_PATH ".chz/refs/tags"
    #define OBJECTS_PATH ".chz/objects"
    #define HEAD_PATH ".chz/HEAD"
    #define INDEX_PATH ".chz/index"
    #define CONFIG_PATH ".chz/config"
    #define DESC_PATH ".chz/description"
    #define STAGING_AREA_PATH ".chz/index"
    #define LOGS_PATH ".chz/logs/"
    #define DATA_PATH ".chz/data"
    #define TAGS_DATA_PATH ".chz/data/tags"
    #define PACK_PUSH_PATH ".chz/objects/compressed"
    #define PACK_PULL_PATH ".chz/objects/restored"
    #define TAG_NAME_FILE ".chz/tag"
    #define ORIGIN_FILE ".chz/origin"
    #define IGNORE_FILE ".chzignore"

    //~ Offsets
    #define ARG_BASE 0

    //~ Permissions
    #define DEF_PERM 0700
    #define ALL_PERM 0755

    //~ Autism
    #define CHZ_ERROR_MSG_START "CHZ ERROR: "
    #define ADD_ERROR_MSG_START "ADD ERROR: "
    #define BRANCH_ERROR_MSG_START "BRANCH ERROR: "
    #define CHECKOUT_ERROR_MSG_START "CHECKOUT ERROR: "
    #define CLONE_ERROR_MSG_START "CLONE ERROR: "
    #define COMMIT_ERROR_MSG_START "COMMIT ERROR: "
    #define DESCRIBE_ERROR_MSG_START "DESCRIBE ERROR: "
    #define FETCH_ERROR_MSG_START "FETCH ERROR: "
    #define GREP_ERROR_MSG_START "GREP ERROR: "
    #define INIT_ERROR_MSG_START "INIT ERROR: "
    #define LOG_ERROR_MSG_START "LOG ERROR: "
    #define MERGE_ERROR_MSG_START "MERGE ERROR: "
    #define PULL_ERROR_MSG_START "PULL ERROR: "
    #define PUSH_ERROR_MSG_START "PUSH ERROR: "
    #define STATUS_ERROR_MSG_START "STATUS ERROR: "
    #define TAG_ERROR_MSG_START "TAG ERROR: "

    #define CHZ_REPORT_MSG_START "CHZ REPORT: "
    #define ADD_REPORT_MSG_START "ADD REPORT: "
    #define BRANCH_REPORT_MSG_START "BRANCH REPORT: "
    #define CHECKOUT_REPORT_MSG_START "CHECKOUT REPORT: "
    #define CLONE_REPORT_MSG_START "CLONE REPORT: "
    #define COMMIT_REPORT_MSG_START "COMMIT REPORT: "
    #define DESCRIBE_REPORT_MSG_START "DESCRIBE REPORT: "
    #define FETCH_REPORT_MSG_START "FETCH REPORT: "
    #define GREP_REPORT_MSG_START "GREP REPORT: "
    #define INIT_REPORT_MSG_START "INIT REPORT: "
    #define LOG_REPORT_MSG_START "LOG REPORT: "
    #define MERGE_REPORT_MSG_START "MERGE REPORT: "
    #define PULL_REPORT_MSG_START "PULL REPORT: "
    #define PUSH_REPORT_MSG_START "PUSH REPORT: "
    #define STATUS_REPORT_MSG_START "STATUS REPORT: "
    #define TAG_REPORT_MSG_START "TAG REPORT: "

    #define MSG_END ".\n"

    //~ Functions
    int checkChz();
    bool checkForFile(char *file);
    bool dirExists(const char *path);
    bool branchExists(char *branch);

    int isDir(const char *path);
    int isBinary(const char *path);
    bool checkIgnore(char *file, const char *relative_path);

    char *getHead();
    char *getLatestHash(char *branch);

    void whatIsTheError();
    void reverseString(char *s);
    int removeDir(const char *dirPath);
    const char *makeRelativePath(const char *fullpath, const char *root_path);



    //& DType Template
    struct AccountChz;
    struct RepositoryChz;

    typedef struct AccountChz AccountChz;
    typedef struct RepositoryChz RepositoryChz;

    //~ Account settings data type
    struct AccountChz
    {
        char *email;
        long password;
        char *username;
        char *phone;
    };

    //~ General data type for a Repository
    struct RepositoryChz
    {
        char repoName[64];
        char repoURL[512];
        unsigned char *data;
        size_t dataLen;
    };


#endif
