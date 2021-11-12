"""
This code defines class which takes data from the HGMJ database and outputs
a graphical representation of a month's worth of data.

Run me with `python3 monthly_graph_maker.py` and then follow any in-terminal
instructions.
"""

# Standard imports.
import sys
import time
from datetime import datetime

# Local imports.
from graph_maker import GraphMaker, MONTHS_IN_A_YEAR, MONTH_NAMES

##############
# MAIN CLASS #
##############

class MonthlyGraphMaker(GraphMaker):
    """ The class in question. """
    def __init__(self, month_no=None, year=None, show_graph=False):
        super().__init__(show_graph=show_graph)
        self.current_month_no = self.get_current_month_no(month_no)
        self.current_year = self.get_current_year(year)
        self.prev_month_no = deincrement_month(self.current_month_no)
        self.prev_year = self.get_prev_year()
        self.current_timestamp = \
            month_and_year_to_epoch(
                self.current_month_no,
                self.current_year
            )
        self.prev_timestamp = \
            month_and_year_to_epoch(self.prev_month_no, self.prev_year)
        self.title = (
            "Summary for "+MONTH_NAMES[self.prev_month_no-1]+" "+
            str(self.prev_year)
        )
        self.filename = (
            MONTH_NAMES[self.prev_month_no-1].lower()+
            str(self.prev_year)+".png"
        )

    def get_current_month_no(self, month_no):
        """ Ronseal. """
        if month_no:
            return month_no
        now = datetime.now()
        result = now.month
        return result

    def get_current_year(self, year):
        """ Ronseal. """
        if year:
            return year
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
        print(
            "Current: "+str(self.current_month_no)+", "+
            str(self.current_year)
        )
        print("Prev: "+str(self.prev_month_no)+", "+str(self.prev_year))

####################
# HELPER FUNCTIONS #
####################

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

def print_help():
    """ Print a help message when the user inputs illegal arguments. """
    print(
        "The correct syntax is:\n\n"+
        "    python3 monthly_graph_maker.py [MONTH NUMBER] [YEAR]\n\n"+
        "Where the month number and year are optional."
    )

###################
# RUN AND WRAP UP #
###################

def run():
    try:
        if len(sys.argv) >= 3:
            mgm = \
                MonthlyGraphMaker(
                   month_no=int(sys.argv[1]),
                   year=int(sys.argv[2])
                )
        elif len(sys.argv) == 2:
            mgm = MonthlyGraphMaker(month_no=int(sys.argv[1]))
        else:
            mgm = MonthlyGraphMaker()
    except ValueError:
        print_help()
        return
    mgm.make_graph()

if __name__ == "__main__":
    run()
