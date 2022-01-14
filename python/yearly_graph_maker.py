"""
This code defines class which takes data from the HGMJ database and outputs
a graphical representation of a calendar year's worth of data.

Run me with `python3 yearly_graph_maker.py` and then follow any in-terminal
instructions.
"""

# Standard imports.
import sys
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

def print_help():
    """ Print a help message if the user tried to use illegal arguments. """
    print(
        "The correct syntax is:\n\n"+
        "    python3 yearly_graph_maker.py [YEAR]\n\n"+
        "Where the year is optional."
    )

###################
# RUN AND WRAP UP #
###################

def run():
    try:
        if len(sys.argv) >= 2:
            ygm = YearlyGraphMaker(year=int(sys.argv[1]))
        else:
            ygm = YearlyGraphMaker()
    except ValueError:
        print_help()
        return
    ygm.make_graph()

if __name__ == "__main__":
    run()
