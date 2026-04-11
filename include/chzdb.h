#include "chizel.h"
#include <postgresql/libpq-fe.h>

#ifndef CHZDB_H
#define CHZDB_H

    PGresult* restoreFromDB(const char* table, const char* content, const char* condition, const char* cond_value);
    bool uploadRepo(RepositoryChz repo);

#endif