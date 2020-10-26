"""
This code defines class which takes data from the HGMJ database and outputs
a graphical representation of a month's worth of data.

Run me with `python3 monthly_graph_maker.py` and then follow the in-terminal
instructions.
"""

# Standard imports.
import os
import matplotlib.pyplot as plt
import time
from datetime import datetime

# Local constants.
MONTHS_IN_A_YEAR = 12
PRINTOUT_FN = "printout.csv"
SQL_FN = "select_month.sql"
MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
               "Sep", "Oct", "Nov", "Dec"]

##############
# MAIN CLASS #
##############

class MonthlyGraphMaker:
    """ The class in question. """
    def __init__(self, show_graph=False):
        self.show_graph = show_graph
        self.current_month_no = self.get_current_month_no()
        self.current_year = self.get_current_year()
        self.prev_month_no = deincrement_month(self.current_month_no)
        self.prev_year = self.get_prev_year()
        self.current_timestamp = month_and_year_to_epoch(
                                     self.current_month_no,
                                     self.current_year)
        self.prev_timestamp = month_and_year_to_epoch(self.prev_month_no,
                                                      self.prev_year)
        self.data_x = []
        self.data_y = []

    def get_current_month_no(self):
        """ Ronseal. """
        now = datetime.now()
        result = now.month
        return result

    def get_current_year(self):
        """ Ronseal. """
        now = datetime.now()
        result = now.year
        return result

    def get_prev_year(self):
        """ Get the year of the month before this one. """
        if self.current_month_no == 1:
            result = self.current_year-1
        else:
            result = self.current_year
        return result

    def print_months_and_years(self):
        """ A debugging method. """
        print("Current: "+str(self.current_month_no)+", "+
              str(self.current_year))
        print("Prev: "+str(self.prev_month_no)+", "+
              str(self.prev_year))

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
        month_name = MONTH_NAMES[self.prev_month_no-1]
        plt.plot(self.data_x, self.data_y)
        plt.tick_params(axis="x", which="both", bottom=False, top=False,
                        labelbottom=False)
        plt.title("Summary for "+month_name+" "+str(self.prev_year))
        plt.xlabel("Time")
        plt.ylabel("Pain Score")
        plt.ylim(0, 9)
        plt.savefig(month_name.lower()+str(self.prev_year)+".png")
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

def deincrement_month(current_month_no):
    """ Get the month number if the month before this one. """
    if current_month_no == 1:
        result = MONTHS_IN_A_YEAR
    else:
        result = current_month_no-1
    return result

def month_and_year_to_epoch(month_no, year):
    """ Convert a month and year to the epoch time for the first second of
    said month. """
    month_str = str(month_no)
    if len(month_str) == 1:
        month_str = "0"+month_str
    date_and_time = "01."+month_str+"."+str(year)+" 00:00:01"
    pattern = "%d.%m.%Y %H:%M:%S"
    result = int(time.mktime(time.strptime(date_and_time, pattern)))
    return result

###################
# RUN AND WRAP UP #
###################

def run():
    mgm = MonthlyGraphMaker()
    mgm.make_graph()

if __name__ == "__main__":
    run()
