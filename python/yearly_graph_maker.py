"""
This code defines class which takes data from the HGMJ database and outputs
a graphical representation of a calendar year's worth of data.

Run me with `python3 yearly_graph_maker.py` and then follow any in-terminal
instructions.
"""

# Standard imports.
import argparse
import time
from datetime import datetime

# Local imports.
from graph_maker import GraphMaker

##############
# MAIN CLASS #
##############

class YearlyGraphMaker(GraphMaker):
    """ The class in question. """
    def __init__(self, year=None, show_graph=False):
        super().__init__(show_graph=show_graph)
        self.current_year = self.get_current_year(year)
        self.prev_year = self.current_year-1
        self.left_timestamp = year_to_epoch(self.prev_year)
        self.right_timestamp = year_to_epoch(self.current_year)
        self.title = "Summary for "+str(self.prev_year)
        self.filename = str(self.prev_year)+".png"

    def get_current_year(self, year):
        """ Ronseal. """
        if year:
            return year
        now = datetime.now()
        result = now.year
        return result

    def print_years(self):
        """ A debugging method. """
        print("Current: "+str(self.current_year))
        print("Prev: "+str(self.prev_year))

####################
# HELPER FUNCTIONS #
####################

def year_to_epoch(year):
    """ Convert a month and year to the epoch time for the first second of
    said month. """
    date_and_time = "01.01."+str(year)+" 00:00:01"
    pattern = "%d.%m.%Y %H:%M:%S"
    result = int(time.mktime(time.strptime(date_and_time, pattern)))
    return result

###################
# RUN AND WRAP UP #
###################

def make_parser():
    """ Return a parser argument. """
    result = \
        argparse.ArgumentParser(
            description="Make the graph for a given year"
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
    ygm = YearlyGraphMaker(year=arguments.year)
    ygm.make_graph()

if __name__ == "__main__":
    run()
