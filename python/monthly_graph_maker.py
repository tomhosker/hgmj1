"""
This code defines class which takes data from the HGMJ database and outputs a
graphical representation of a month's worth of data.

Run me with `python3 monthly_graph_maker.py` and then follow any in-terminal
instructions.
"""

# Standard imports.
import argparse
import time
from datetime import datetime

# Local imports.
from graph_maker import GraphMaker, MONTHS_IN_A_YEAR, MONTH_NAMES

##############
# MAIN CLASS #
##############

class MonthlyGraphMaker(GraphMaker):
    """ The class in question. """
    def __init__(self, month_num=None, year=None, show_graph=False):
        super().__init__(show_graph=show_graph)
        self.current_month_num = self.get_current_month_num()
        self.current_year = self.get_current_year()
        self.month_num = self.get_month_num(month_num)
        self.year = self.get_year(year)
        self.current_timestamp = \
            month_and_year_to_epoch(
                self.current_month_num,
                self.current_year
            )
        self.left_timestamp = \
            month_and_year_to_epoch(self.month_num, self.year)
        self.right_timestamp = \
            next_month_and_year_to_epoch(self.month_num, self.year)
        self.title = \
            "Summary for "+MONTH_NAMES[self.month_num-1]+" "+str(self.year)
        self.filename = \
            MONTH_NAMES[self.month_num-1].lower()+str(self.year)+".png"

    def get_current_month_num(self):
        """ Ronseal. """
        now = datetime.now()
        result = now.month
        return result

    def get_month_num(self, month_num):
        """ Deincrement the current month, unless a specific month is given. """
        if month_num:
            return month_num
        result = deincrement_month(self.current_month_num)
        return result

    def get_current_year(self):
        """ Ronseal. """
        now = datetime.now()
        result = now.year
        return result

    def get_year(self, year):
        """ Deincrement the current year, unless a specific year is given. """
        if year:
            return year
        elif self.current_month_num == 1:
            result = self.current_year-1
        else:
            result = self.current_year
        return result

    def print_months_and_years(self):
        """ A debugging method. """
        print(
            "Current: "+str(self.current_month_num)+", "+str(self.current_year)
        )
        print("To print: "+str(self.month_num)+", "+str(self.year))

####################
# HELPER FUNCTIONS #
####################

def deincrement_month(current_month_num):
    """ Get the month number if the month before this one. """
    if current_month_num == 1:
        result = MONTHS_IN_A_YEAR
    else:
        result = current_month_num-1
    return result

def month_and_year_to_epoch(month_num, year):
    """ Convert a month and year to the epoch time for the first second of
    said month. """
    month_str = str(month_num)
    if len(month_str) == 1:
        month_str = "0"+month_str
    date_and_time = "01."+month_str+"."+str(year)+" 00:00:01"
    pattern = "%d.%m.%Y %H:%M:%S"
    result = int(time.mktime(time.strptime(date_and_time, pattern)))
    return result

def next_month_and_year_to_epoch(month_num, year):
    """ Convert a month and year to the epoch time for the first second of
    the FOLLOWING month. """
    if month_num == MONTHS_IN_A_YEAR:
        next_month_num = 1
        next_year = year+1
    else:
        next_month_num = month_num+1
        next_year = year
    return month_and_year_to_epoch(next_month_num, next_year)

###################
# RUN AND WRAP UP #
###################

def make_parser():
    """ Return a parser argument. """
    result = \
        argparse.ArgumentParser(
            description="Make the graph for a given month"
        )
    result.add_argument(
        "--month-num",
        default=None,
        dest="month_num",
        help="The month number, where 1 = January",
        type=int
    )
    result.add_argument(
        "--year",
        default=None,
        dest="year",
        help="The year in question",
        type=int
    )
    return result

def run():
    """ Run this file. """
    parser = make_parser()
    arguments = parser.parse_args()
    mgm = MonthlyGraphMaker(month_num=arguments.month_num, year=arguments.year)
    mgm.make_graph()

if __name__ == "__main__":
    run()
