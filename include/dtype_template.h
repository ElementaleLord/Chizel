#ifndef DTYPE_TEMPLATE_H
#define DTYPE_TEMPLATE_H

#include <time.h>
#include <string.h>
#include <stdbool.h>

struct BranchChz;

enum FileStatus
{
    MODIFIED, 
    UNMODIFIED, 
    REMOVED, 
    ADDED
};

enum AthenticationMethod
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

typedef struct
{// a file with a status attached
    FileStatus status;
    char* FileName;
}StatusFile;

typedef struct
{// a file with a date attached
    time_t date;
    long* fileObj;
}DateFile;

typedef struct
{// used to track the category and status of a pull request
    PullRequestCategory pullReqCat;
    PullRequestStatus pullReqStatus;
}PullRequestType;

typedef struct
{//? Account Settings Data Type
    char* email;
    long password;// should be a hashed ref
    char* username;
    bool twoFactorAuth;
    AthenticationMethod method;
}AccountChz;

typedef struct
{// General data type for a Commit
    char* commitName;
    char* commitMsg;
    time_t commitDate;
    BranchChz* commitBranch;
    BranchChz* mergeBranch;
    StatusFile* commitedChanges;
}CommitChz;

typedef struct
{// defines a name and points to some commit
    char* label;
    CommitChz* commitPtr;
}LightTag;

typedef struct
{// expansion on light tag that additionally track date and user which created this tag
    char* label;
    CommitChz* commitPtr;
    AccountChz* creater;
    time_t HTagDate;
    char* HTagMsg;
}HeavyTag;

typedef struct
{// General data type for a Repository
    char* repoName;
    time_t repoDate;
    char* repoURL;
    long icon;
    //RepositoryLogEntry* repoLog;// array of log entries (i think we defined this to make git log easier to code? maybe)
    LightTag* ptrMap;// array of light tags
    HeavyTag* tagMap;// array of heavy tags
    BranchChz** branches;// array of branch pointers
}RepositoryChz;

struct BranchChz
{// General data type for a Branch
    char* branchName;
    time_t branchDate;
    DateFile* branchData;
    RepositoryChz* parentRepo;
    CommitChz* latestCommit;
};


typedef struct
{// used as one entry in a repositories history log
    time_t logEntrydate;
    CommitChz* RepLogData;
}RepositoryLogEntry;

typedef struct
{// defines the extra data needed by a forked repository
    char* originalURL;
    time_t forkDate;
    long vNum;
}RepoFork;

typedef struct
{// General data type for a  PullRequest
    char* pullRequestName;
    char* pullRequestMsg;
    time_t createDate;
    time_t submitDate;
    time_t resolveDate;

}PullRequest;

typedef struct BranchChz BranchChz;
#endif
