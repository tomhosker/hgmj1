"""
This code defines class which takes the full journal from the HGMJ database and
outputs a graphical representation of a calendar year's worth of data.

Run me with `python3 full_graph_maker.py` and then follow any in-terminal
instructions.
"""

# Local imports.
from graph_maker import GraphMaker

# Local constants.
ETERNITY = 10000000000

##############
# MAIN CLASS #
##############

class FullGraphMaker(GraphMaker):
    """ The class in question. """
    def __init__(self, show_graph=False):
        GraphMaker.__init__(self, show_graph=show_graph)
        self.current_timestamp = ETERNITY
        self.prev_timestamp = 0
        self.title = "Summary of the Whole Journal"
        self.filename = "full.png"

###################
# RUN AND WRAP UP #
###################

def run():
    fgm = FullGraphMaker()
    fgm.make_graph()

if __name__ == "__main__":
    run()
