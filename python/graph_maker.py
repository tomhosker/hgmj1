"""
This code defines a TEMPLATE CLASS from which graph makers for various units
of time can be constructed.
"""

# Standard imports.
import os
import matplotlib.pyplot as plt
import subprocess

# Local constants.
MONTHS_IN_A_YEAR = 12
DEFAULT_PRINTOUT_FILENAME = "printout.csv"
DEFAULT_SQL_FILENAME = "get_graph_data.sql"
MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",
    "Nov", "Dec"
]
LOWER_PAIN_SCORE_LIMIT = 0
UPPER_PAIN_SCORE_LIMIT = 9
DEFAULT_TITLE = "Summary"
DEFAULT_OUTPUT_FILENAME = "summary.png"

##############
# MAIN CLASS #
##############

class GraphMaker:
    """ The class in question. """
    def __init__(self, show_graph=False, sql_filename=DEFAULT_SQL_FILENAME,
                 printout_filename=DEFAULT_PRINTOUT_FILENAME):
        self.show_graph = show_graph
        self.sql_filename = sql_filename
        self.printout_filename = printout_filename
        self.left_timestamp = 0
        self.right_timestamp = 0
        self.data_x = []
        self.data_y = []
        self.title = DEFAULT_TITLE
        self.filename = DEFAULT_OUTPUT_FILENAME

    def rewrite_sql(self):
        """ Rewrite the SQL script we're going execute. """
        query = (
            "\copy (SELECT * FROM JournalEntry "+
            "WHERE thetimestamp BETWEEN "+str(self.left_timestamp)+" AND "+
            str(self.right_timestamp)+" "+
            "ORDER BY thetimestamp ASC) TO "+self.printout_filename+" "+
            "WITH csv"
        )
        with open(self.sql_filename, "w") as sql_file:
            sql_file.write(query)

    def run_sql(self):
        """ Run an SQL script through the database. """
        with open(self.sql_filename) as sql_file:
            subprocess.run(
                ["heroku", "pg:psql", "--app", "hgmj"],
                stdin=sql_file,
                stdout=subprocess.DEVNULL,
                check=True
            )
 
    def execute_sql(self):
        """ Execute the SQL script we've rewritten. """
        if not ensure_logged_in():
            return False
        self.rewrite_sql()
        self.run_sql()
        os.remove(self.sql_filename)
        return True

    def collect_data(self):
        """ Collect the data from the .csv file. """
        with open(self.printout_filename, "r") as printout:
            lines = printout.readlines()
            for line in lines:
                elements = line.split(",")
                self.data_x.append(int(elements[2]))
                self.data_y.append(int(elements[1]))
        os.remove(self.printout_filename)

    def draw_graph(self):
        """ Draw the graph of the data. """
        plt.plot(self.data_x, self.data_y)
        plt.tick_params(axis="x", which="both", bottom=False, top=False,
                        labelbottom=False)
        plt.title(self.title)
        plt.xlabel("Time")
        plt.ylabel("Pain Score")
        plt.ylim(LOWER_PAIN_SCORE_LIMIT, UPPER_PAIN_SCORE_LIMIT)
        plt.savefig(self.filename)
        if self.show_graph:
            plt.show()

    def make_graph(self):
        if not self.execute_sql():
            return False
        self.collect_data()
        self.draw_graph()
        return True

####################
# HELPER FUNCTIONS #
####################

def ensure_logged_in():
    """ Make sure that we're logged into Heroku first. """
    process = \
        subprocess.run(["heroku", "whoami"], stdout=subprocess.DEVNULL)
    if process.returncode != 0:
        print(
            "Please log in to Heroku using \"heroku login\" before "+
            "running me, and try again."
        )
        return False
    return True

###################
# RUN AND WRAP UP #
###################

def run():
    gm = GraphMaker()
    gm.make_graph()

if __name__ == "__main__":
    run()
