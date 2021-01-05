"""
This code defines a TEMPLATE CLASS from which graph makers for various units
of time can be constructed.
"""

# Standard imports.
import os
import matplotlib.pyplot as plt

# Local constants.
MONTHS_IN_A_YEAR = 12
PRINTOUT_FN = "printout.csv"
SQL_FN = "get_graph_data.sql"
MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
               "Sep", "Oct", "Nov", "Dec"]
LOWER_PAIN_SCORE_LIMIT = 0
UPPER_PAIN_SCORE_LIMIT = 9
DEFAULT_TITLE = "Summary"
DEFAULT_OUTPUT_FILENAME = "summary.png"

##############
# MAIN CLASS #
##############

class GraphMaker:
    """ The class in question. """
    def __init__(self, show_graph=False):
        self.show_graph = show_graph
        self.current_timestamp = 0
        self.prev_timestamp = 0
        self.data_x = []
        self.data_y = []
        self.title = DEFAULT_TITLE
        self.filename = DEFAULT_OUTPUT_FILENAME

    def rewrite_sql(self):
        """ Rewrite the SQL script we're going execute. """
        first_part = "\copy (SELECT * FROM JournalEntry "
        middle_part = ("WHERE thetimestamp >= "+
                       str(self.prev_timestamp)+" AND thetimestamp < "+
                       str(self.current_timestamp))+" "
        last_part = "ORDER BY thetimestamp ASC) TO "+PRINTOUT_FN+" WITH csv"
        sql = first_part+middle_part+last_part
        with open(SQL_FN, "w") as sql_file:
            sql_file.write(sql)

    def execute_sql(self):
        """ Execute the SQL script we've rewritten. """
        if not ensure_logged_in():
            return False
        self.rewrite_sql()
        run_sql()
        os.remove(SQL_FN)
        return True

    def collect_data(self):
        """ Collect the data from the .csv file. """
        with open(PRINTOUT_FN, "r") as printout:
            lines = printout.readlines()
            for line in lines:
                elements = line.split(",")
                self.data_x.append(int(elements[2]))
                self.data_y.append(int(elements[1]))
        os.remove(PRINTOUT_FN)

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
    if os.system("heroku whoami > /dev/null") != 0:
        print("Please log in to Heroku using \"heroku login\" before "+
              "running me, and try again.")
        return False
    return True

def run_sql():
    """ Run an SQL script through the database. """
    os.system("heroku pg:psql --app hgmj < "+SQL_FN+" > /dev/null")

###################
# RUN AND WRAP UP #
###################

def run():
    gm = GraphMaker()
    gm.make_graph()

if __name__ == "__main__":
    run()
