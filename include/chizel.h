//~ indicates the explanation of a near (usually below) function
//! <:> indicates some MAJOR ERROR or some MISSING portion that need be done
//@ indicates important distinctions
//# a comment used to explain the existence of some variables (mainly for P:)
//$ <:> indicates a todo task of some sort (less urgent version of //!), careful while removing
//% indicates more minor distinctions
//? <:> indicates questions
//^ <:> indicates responses (usually placed under a //?)
//& NOTE-# <:> indicates important NOTES
//* <:> indicates changes or REALLY IMPORTANT SHIT
/// indicates redacted but still needed comment

/*
also try to respect the "formatting" of each one
if one above has <:> in it use the below keys to id who saying that 
P: is ElementaleLord
O: is Voltro
B: is Cloak
F: is Faust
//& NOTE-1 P: if more that one <:> then only count the first one to the comment
//& NOTE-1 P: others just indicate comment maker taklking to or about someone else
*/

#include <time.h>       //# for header
#include <stddef.h>     //# for header
#include <string.h>     //# all files 
#include <stdbool.h>    //# all files
#include <stdio.h>      //# all files
#include <stdlib.h>     //# all files

#ifndef CHIZEL_H
#define CHIZEL_H

    //~ Paths
    #define CHZ_PATH ".chz"
    #define BRANCHES_PATH ".chz/branches"
    #define REFS_PATH ".chz/refs"
    #define REFS_HEADS_PATH ".chz/refs/heads"
    #define REFS_TAGS_PATH ".chz/refs/tags"
    #define OBJECTS_PATH ".chz/objects"
    #define OBJECTS_INFO_PATH ".chz/objects/info"
    #define INFO_PATH ".chz/info"
    #define HEAD_PATH ".chz/HEAD"
    #define INDEX_PATH ".chz/index"
    #define CONFIG_PATH ".chz/config"
    #define DESC_PATH ".chz/description"
    #define STAGING_AREA_PATH ".chz/index"
    #define ORIGIN_FILE  ".chz/origin"
    //! #define HOOKS_PATH ".chz/hooks"
    //! #define UNPACK_REFS_PATH ".chz/unpacked-refs"

    //~ Offsets
    #define ARG_BASE -1

    //~ Permissions
    #define DEF_PERM 0700
    #define ALL_PERM 0755
    
    //~ Autism
    #define  CHZ_ERROR_MSG_START "CHZ ERROR: "
    #define  ADD_ERROR_MSG_START "ADD ERROR: "
    #define  BRANCH_ERROR_MSG_START "BRANCH ERROR: "
    #define  CHECKOUT_ERROR_MSG_START "CHECKOUT ERROR: "
    #define  CLONE_ERROR_MSG_START "CLONE ERROR: "
    #define  COMMIT_ERROR_MSG_START "COMMIT ERROR: "
    #define  DESCRIBE_ERROR_MSG_START "DESCRIBE ERROR: "
    #define  FETCH_ERROR_MSG_START "FETCH ERROR: "
    #define  GREP_ERROR_MSG_START "GREP ERROR: "
    #define  INIT_ERROR_MSG_START "INIT ERROR: "
    #define  LOG_ERROR_MSG_START "LOG ERROR: "
    #define  MERGE_ERROR_MSG_START "MERGE ERROR: "
    #define  PULL_ERROR_MSG_START "PULL ERROR: "
    #define  PUSH_ERROR_MSG_START "PUSH ERROR: "
    #define  STATUS_ERROR_MSG_START "STATUS ERROR: "
    #define  TAG_ERROR_MSG_START "TAG ERROR: "
    
    #define  CHZ_REPORT_MSG_START "CHZ REPORT: "
    #define  ADD_REPORT_MSG_START "ADD REPORT: "
    #define  BRANCH_REPORT_MSG_START "BRANCH REPORT: "
    #define  CHECKOUT_REPORT_MSG_START "CHECKOUT REPORT: "
    #define  CLONE_REPORT_MSG_START "CLONE REPORT: "
    #define  COMMIT_REPORT_MSG_START "COMMIT REPORT: "
    #define  DESCRIBE_REPORT_MSG_START "DESCRIBE REPORT: "
    #define  FETCH_REPORT_MSG_START "FETCH REPORT: "
    #define  GREP_REPORT_MSG_START "GREP REPORT: "
    #define  INIT_REPORT_MSG_START "INIT REPORT: "
    #define  LOG_REPORT_MSG_START "LOG REPORT: "
    #define  MERGE_REPORT_MSG_START "MERGE REPORT: "
    #define  PULL_REPORT_MSG_START "PULL REPORT: "
    #define  PUSH_REPORT_MSG_START "PUSH REPORT: "
    #define  STATUS_REPORT_MSG_START "STATUS REPORT: "
    #define  TAG_REPORT_MSG_START "TAG REPORT: "

    #define MSG_END ".\n"



    //~ Functions
    bool checkForFile(char *file);
    bool checkChz(); 
    bool checkStagingArea();
    FILE* getStagingArea();
    bool clearStagingArea();
    void whatIsTheError();


    //& DType Template
    struct StatusFile;
    struct DateFile;
    struct PullRequestType;
    struct AccountChz;
    struct CommitChz;
    struct LightTag;
    struct HeavyTag;
    struct RepositoryChz;
    struct BranchChz;
    struct RepositoryLogEntry;
    struct RepoFork;
    struct PullRequest;

    typedef enum FileStatus FileStatus;
    typedef enum AuthenticationMethod AuthenticationMethod;
    typedef enum ActionType ActionType;
    typedef enum PullRequestCategory PullRequestCategory;
    typedef enum PullRequestStatus PullRequestStatus;

    typedef struct StatusFile StatusFile;
    typedef struct DateFile DateFile;
    typedef struct PullRequestType PullRequestType;
    typedef struct AccountChz AccountChz;
    typedef struct CommitChz CommitChz;
    typedef struct LightTag LightTag;
    typedef struct HeavyTag HeavyTag;
    typedef struct RepositoryChz RepositoryChz;
    typedef struct BranchChz BranchChz;
    typedef struct RepositoryLogEntry RepositoryLogEntry;
    typedef struct RepoFork RepoFork;
    typedef struct PullRequest PullRequest;

    enum FileStatus
    {
        MODIFIED, 
        UNMODIFIED, 
        REMOVED, 
        ADDED
    };

    enum AuthenticationMethod
    {
        SECONDARY_EMAIL, 
        PHONE_NUMBER, 
        AUTHENTICATOR_APP
    };

    enum ActionType
    {
        CREATE, 
        DELETE, 
        VIEW
    };

    enum PullRequestCategory
    {
        OPEN, 
        CLOSED
    };

    enum PullRequestStatus
    {
        ACCEPTED, 
        REJECTED, 
        APPLIED, 
        NUL
    };

    //~ A file with a status attached
    struct StatusFile
    {
        FileStatus status;
        char* FileName;
    };

    //~ A file with a date attached
    struct DateFile
    {
        time_t date;
        long* fileObj;
    };

    //~ Tracks the category and status of a PullRequest
    struct PullRequestType
    {
        PullRequestCategory pullReqCat;
        PullRequestStatus pullReqStatus;
    };

    //~ Account settings data type
    struct AccountChz
    {
        char* email;
        long password;      //? should be a hashed ref
        char* username;
        bool twoFactorAuth;
        AuthenticationMethod method;
    };

    //~ General data type for a Commit
    struct CommitChz
    {
        char* commitName;
        char* commitMsg;
        time_t commitDate;
        BranchChz* commitBranch;
        BranchChz* mergeBranch;
        StatusFile* commitedChanges;
    };

    //~ Defines a name and points to some commit
    struct LightTag
    {
        char* label;
        CommitChz* commitPtr;
    };

    //~ Expansion on light tag that additionally track date and user which created this tag
    struct HeavyTag
    {
        char* label;
        CommitChz* commitPtr;
        AccountChz* creater;
        time_t HTagDate;
        char* HTagMsg;
    };

    //~ General data type for a Repository
    struct RepositoryChz
    {
        char* repoName;
        time_t repoDate;
        char* repoURL;
        long icon;
        //RepositoryLogEntry* repoLog;      //# array of log entries (i think we defined this to make git log easier to code? maybe)
        LightTag* ptrMap;                   //# array of light tags
        HeavyTag* tagMap;                   //# array of heavy tags
        BranchChz** branches;               //# array of branch pointers
    };

    //~ General data type for a Branch
    struct BranchChz
    {
        char* branchName;
        time_t branchDate;
        DateFile* branchData;
        RepositoryChz* parentRepo;
        CommitChz* latestCommit;
    };

    //~ Used as one entry in a repositories history log
    struct RepositoryLogEntry
    {
        time_t logEntrydate;
        CommitChz* RepLogData;
    };

    //~ Defines the extra data needed by a forked repository
    struct RepoFork
    {
        char* originalURL;
        time_t forkDate;
        long vNum;
    };

    //~ General data type for a PullRequest
    struct PullRequest
    {
        char* pullRequestName;
        char* pullRequestMsg;
        time_t createDate;
        time_t submitDate;
        time_t resolveDate;
        PullRequestType status;
    };



    //& Init Template
    //~ File and content pair
    typedef struct
    {
        const char* path;
        const char* data;
    }TemplateValue;

    //~ .chz dir template
    static const TemplateValue REPO_TEMPLATE[] =
    {
        {CHZ_PATH,              NULL},
        {REFS_PATH,             NULL},
        {REFS_HEADS_PATH,       NULL},
        {REFS_TAGS_PATH,        NULL},
        {OBJECTS_PATH,          NULL},
        {OBJECTS_INFO_PATH,     NULL},
        {INFO_PATH,             NULL},
        {HEAD_PATH,             "ref: refs/heads/main\n"},
        {INDEX_PATH,            ""},
        {CONFIG_PATH,           "[core]\n\trepositoryformatversion = 0\n"},
        {DESC_PATH,             "Unnamed repository\n"}
    };

    static const size_t REPO_TEMPLATE_SIZE = sizeof(REPO_TEMPLATE) / sizeof(REPO_TEMPLATE[0]);


    //& LCS Algorithm
    typedef struct
    {
        char** content;
        size_t capacity;
        size_t size;
    } Lines;

    int lcs(Lines s1, Lines s2);
    

#endif