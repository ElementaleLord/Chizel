#include "../chizel.h"

#ifndef STATUS_H
#define STATUS_H

    void status(int argc, char *argv[]);

    void displayStatus(Lines list, char *fileType);
    Lines getUntrackedFileList(time_t commitTime, Lines fileList);
    Lines getModifiedFileList(time_t commitTime, Lines fileList);
    Lines getStagedFileList(time_t commitTime, Lines fileList);

#endif