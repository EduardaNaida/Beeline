import StoreTableMyTickets from "./components/StoreTableMyTickets.js";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
  text: {
    fontSize: '150px',
    fontFamily: "cursive",
    [theme.breakpoints.down('sm')]: {
      marginLeft: '45%',
      marginBottom: '125px',
    },
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '120px',
      marginTop: '-20px',
    },
  }
}));

function YourTicketsPage() {
    const classes = useStyles();

    return(
    <div>
        <Link to={`/`}>
                <div>
                    <p className="return"></p>
                </div>
        </Link>

      <h1 className={classes.text}>Tickets</h1>
      <StoreTableMyTickets link="/queue" linktwo="/queuecheckout" filteredStores={window.activeQueues}/>
    </div>
    );
} 

export default YourTicketsPage;