"""
This code defines a set of functions which copy all the important data from
a local SQLite database to the PostgreSQL server, DELETING any data that
was already present on the latter in the process.
"""

# Standard imports.
import sqlite3

# Local imports.
from extract_to_local import DEFAULT_PATH_TO_DB, DEFAULT_TABLE_NAME, \
                             DEFAULT_PRIMARY_KEY, DEFAULT_COLUMNS, \
                             execute_server_query

#############
# FUNCTIONS #
#############

def delete_from_table_server(table_name=DEFAULT_TABLE_NAME):
    """ Delete all the data from a given table in the remote database. """
    query = "DELETE FROM "+table_name+";"
    response = input("Are you sure that you want to delete all the data "+
                     "held in the remote database, and replace it with "+
                     "data held locally? (y/n)\n")
    if response != "y":
        return False
    execute_server_query(query)
    return True

def insert_from_local(path_to_db=DEFAULT_PATH_TO_DB,
                      table_name=DEFAULT_TABLE_NAME,
                      columns=DEFAULT_COLUMNS):
    """ Insert all local records into the remote database. """
    connection = sqlite3.connect(path_to_db)
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM "+table_name+";")
    data = cursor.fetchall()
    connection.close()
    query = ("INSERT INTO "+table_name+" ("+", ".join(columns)+") "+"\n"+
             "VALUES\n")
    data_as_strings = [];
    for record in data:
        record_as_strings = []
        for item in record:
            if not item:
                item_ = "NULL"
            elif isinstance(item, str):
                item_ = item.replace("'", "''")
                item_ = "\'"+item_+"\'"
            else:
                item_ = str(item)
            record_as_strings.append(item_)
        record_string = "    ("+(", ".join(record_as_strings))+")"
        data_as_strings.append(record_string)
    query = query+(",\n".join(data_as_strings))+";"
    execute_server_query(query)

def reset_incrementation(table_name=DEFAULT_TABLE_NAME,
                         primary_key=DEFAULT_PRIMARY_KEY):
    """ Fix a bug in PostgreSQL, which causes auto-incrementation to go awry
    when uploading a lot of data to a table. """
    query = ("SELECT setval(pg_get_serial_sequence('"+table_name+"', '"+
             primary_key+"'), "+"(SELECT MAX("+primary_key+") FROM "+
             table_name+")+1);")
    print(query)
    execute_server_query(query)

def upload_from_local(table_name=DEFAULT_TABLE_NAME,
                      primary_key=DEFAULT_PRIMARY_KEY,
                      path_to_db=DEFAULT_PATH_TO_DB,
                      columns=DEFAULT_COLUMNS):
    """ Delete any data already present in the remote database, and then
    upload all the records held locally. """
    print("Uploading from local database...")
    if not delete_from_table_server(table_name=table_name):
        print("Upload aborted.")
        return False
    insert_from_local(path_to_db=path_to_db, table_name=table_name,
                      columns=columns)
    reset_incrementation(table_name=table_name, primary_key=primary_key)
    print("Upload complete.")

###################
# RUN AND WRAP UP #
###################

def run():
    """ Run this file. """
    upload_from_local()

if __name__ == "__main__":
    run()
