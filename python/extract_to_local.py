"""
This code defines a set of functions which copy all the important data from
the PostgreSQL server to a local SQLite database.
"""

# Standard imports.
import csv
import os
import sqlite3
import subprocess

# Local constants.
DEFAULT_PATH_TO_DB = "local_dump.db"
DEFAULT_PRINTOUT_FN = "printout.csv"
DEFAULT_SQL_FN = "extract.sql"
DEFAULT_TABLE_NAME = "JournalEntry"
DEFAULT_PRIMARY_KEY = "id"
DEFAULT_COLUMNS = ("id", "painScore", "theTimeStamp", "remarks")
DEFAULT_SQLITE_TYPES = ("INTEGER", "INTEGER", "INTEGER", "TEXT")

#############
# FUNCTIONS #
#############

def execute_server_query(query, sql_fn=DEFAULT_SQL_FN):
    """ Run a given query through the PostgreSQL database. """
    with open(sql_fn, "w") as sql_file:
        sql_file.write(query)
    subprocess.check_call(["sh", "execute_sql", sql_fn])
    os.remove(sql_fn)

def extract_to_txt(table_name=DEFAULT_TABLE_NAME,
                   printout_fn=DEFAULT_PRINTOUT_FN):
    """ Extract the contents of a given table to a .txt file. """
    query = ("\copy (SELECT * FROM "+table_name+") TO "+printout_fn+" "+
             "WITH csv;")
    execute_server_query(query)

def make_create_script(table_name=DEFAULT_TABLE_NAME,
                       primary_key=DEFAULT_PRIMARY_KEY,
                       columns=DEFAULT_COLUMNS,
                       sqlite_types=DEFAULT_SQLITE_TYPES):
    """ Return the create script for our SQLite database. """
    if len(columns) != len(sqlite_types):
        raise Exception("The number of columns doesn't match the number "+
                        "of SQLite types.")
    result = "CREATE TABLE "+table_name+"(\n"
    for index in range(len(columns)):
        if index != 0:
            result = result+",\n"
        result = result+"    "+columns[index]+" "+sqlite_types[index]
        if columns[index] == primary_key:
            result = result+" PRIMARY KEY"
    result = result+");"
    return result

def create_local_db(path_to_db=DEFAULT_PATH_TO_DB,
                    create_script=make_create_script()):
    """ Create our SQLite database ex nihilo. """
    if os.path.exists(path_to_db):
        response = input("Overwrite dump at "+path_to_db+"? (y/n)\n")
        if response != "y":
            return False
        os.remove(path_to_db)
    subprocess.check_call(["touch", path_to_db])
    connection = sqlite3.connect(path_to_db)
    cursor = connection.cursor()
    cursor.execute(create_script)
    connection.commit()
    connection.close()
    return True

def add_to_local(data, path_to_db=DEFAULT_PATH_TO_DB,
                 table_name=DEFAULT_TABLE_NAME, columns=DEFAULT_COLUMNS):
    """ Add a given data set to the local database. """
    query = "INSERT INTO "+table_name+" ("
    query = query+(", ".join(columns))
    query = query+")\n"
    query = query+"VALUES ("
    for index in range(len(columns)):
        if index != 0:
            query = query+", "
        query = query+"?"
    query = query+");"
    connection = sqlite3.connect(path_to_db)
    cursor = connection.cursor()
    for record in data:
        cursor.execute(query, record)
    connection.commit()
    connection.close()

def extract_to_local(path_to_db=DEFAULT_PATH_TO_DB,
                     create_script=make_create_script(),
                     printout_fn=DEFAULT_PRINTOUT_FN,
                     table_name=DEFAULT_TABLE_NAME,
                     columns=DEFAULT_COLUMNS):
    """ Copy everything from the remote server into the local database. """
    print("Extracting to local database...")
    if not create_local_db(path_to_db=path_to_db,
                           create_script=create_script):
        os.remove(printout_fn)
        print("Extraction aborted.")
        return False
    extract_to_txt()
    with open(printout_fn, "r") as csv_file:
        data = csv.reader(csv_file, delimiter=",")
        add_to_local(data, path_to_db=path_to_db, table_name=table_name,
                     columns=columns)
    os.remove(printout_fn)
    print("Extraction complete.")
    return True

###################
# RUN AND WRAP UP #
###################

def run():
    """ Run this file. """
    extract_to_local()

if __name__ == "__main__":
    run()
