import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useEffect, useState} from 'react';
import axios from 'axios';
import ICAlogo from '../media/ICAlogo.png'; // gives image path
import ApotekHjärtatlogo from '../media/ApotekHjärtatlogo.png'; // gives image path
import Systembolagetlogo from '../media/Systembolagetlogo.png'; // gives image path
import hemköplogo from '../media/hemköplogo.png'; // gives image path
import Åhlénslogo from '../media/Åhlénslogo.png'; // gives image path
import Maxlogo from '../media/Maxlogo.png'; // gives image path
import Arreniuslogo from '../media/Arreniuslogo.png'; // gives image path

import StoreIcon from '@material-ui/icons/Store';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';



const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      background: 'transparent',
        boxShadow: 'none',
      textAlign: 'left',
      color: theme.palette.text.secondary,
    },
    paper2: {
        padding: theme.spacing(0),
        background: 'transparent',
        boxShadow: 'none',
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
    image: {
        width:'90px',
        height:'50px',
    },
    imageStore: {
        width:'90px',
        height:'50px',
        marginLeft: '-5px',
        marginBottom: '-5px',
    },
    imageCash: {
        width:'90px',
        height:'50px',
        marginLeft: '-8px',
        marginBottom: '-5px',
    },
    button: {
            margin: 'auto', 
            background: '#ffffff', 
            borderRadius: '100px',
        [theme.breakpoints.down('md')]: {
            fontSize: 'xxx-large', 
            marginTop: '30px', 
            maxWidth: '965px', 
            minWidth: '965px', 
            minHeight: '200px', 
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '37px', 
            marginTop: '30px', 
            maxWidth: '800px', 
            minWidth: '800px', 
            minHeight: '200px', 
        },
    },
    adress: {
        padding: theme.spacing(2),
        background: 'transparent',
        boxShadow: 'none',
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }

  }));

/**
 * Will display each row with the store and waiting time for that store.
 * @param store each store in list of stores to display on the homepage
 * @returns a row with each store in it
 */

function StoreRow({store, link, linktwo, from}){
    const { id } = useParams();
    const classes = useStyles();
    const [sensor, setSensor] = useState(0);
    const [waitTime, setWaittime] = useState(0);
    const [queue, setQueue] = useState(0);
    const [checkoutqueue, setCheckoutqueue] = useState(0);
    const [waitTimeofQueue, setWaitTimeofQueue]= useState(0);
    const [waitTimeofCheckQueue, setWaitTimeofCheckQueue] = useState (0);

    /*************  Sensor get *************/
    useEffect(() => {
        if(from == false){
            store = store[0];
        }
        axios.get('/API/v1/sensor/'+store.ID)
        .then((response) => {
            setSensor(response.data.Value);
        })
    }, [sensor]);


    /**
     * Creates a store object for the stores. If storeRow is used in HomePage it will add an 
     * empty UserID and an IsInside bolean depending on if the queue to the store is inside or outside the store.
     * @param store The store props which can either be an complete storeList with [Store,UserID,IsInside] or only a Store
     * @param from A bolean that is true if StoreRow is used in HomePage and false if StoreRow is used in YourTicketsPage
     * @returns A store list that contains [Store, UserID, IsInside]. Where store is the store object, UserID is empty or 
     *          the user's ID and IsInside that is true if the queue to the store is inside and false if queue is outside the store.
     */
    function createstoreList(store, from) {
        if(from == true){//Homepage
            if(sensor == store.Max){//If store is full maybe change to this if(sensor >= store.Max){, maybe put this function insidea useeffect?
                return ([store, "", false]);
            }
            if(sensor != store.Max){//If store is not full
                return ([store, "", true]);
            }
        }
        if(from == false){//MyTickets
                return store;
            }
        }
    //storeList is [Store,UserID,IsInside]
    const storeList = createstoreList(store, from);
    //storeObject is only the store object: {ID,Name,Address,Max,IconURL}
    const storeObject = storeList[0];

    useEffect(() => {
       
        axios.get('/API/v1/queue/length/'+storeObject.ID)
        .then((response) => {
            setQueue(response.data.QueueLength);
        })
    }, [queue]);

    useEffect(() => {
        axios.get('/API/v1/checkout/queue/length/'+storeObject.ID)
        .then((response) => {
            setCheckoutqueue(response.data.QueueLength);
        })
    }, [checkoutqueue]);
 
    useEffect(() => {
        //Check if store is full if true simulate a queue, if false don't create a queue
        if(storeList[2] == false){        
            /************* get waitingtime *************/
            axios.get('/API/v1/queue/waittime/'+storeObject.ID)
            .then((response) => {
                    setWaittime(Math.round(response.data.WaitTime));
            })
            } else{
                axios.get('/API/v1/checkout/queue/waittime/'+storeObject.ID)
                .then((response) => {
                        setWaittime(Math.round(response.data.WaitTime));
                })
            }
    }, [waitTime]);
    
    
    if (waitTimeofQueue === 0 && waitTime && queue){
        const timeSec = (waitTime*queue)/60;
        if (timeSec < 1){
            setWaitTimeofQueue("<1");
        }
        else {
            setWaitTimeofQueue(Math.round(timeSec));
        }
        
        console.log("set queue " + timeSec);
    }

    if (waitTimeofCheckQueue === 0 && waitTime && checkoutqueue){
        const timeSec = (waitTime*checkoutqueue)/60;
        if (timeSec < 1){
            setWaitTimeofCheckQueue("<1");
        }
        else{
            setWaitTimeofCheckQueue(Math.round(timeSec));
        }
        console.log("set check " + timeSec);
    }
        
    /**
     * A function that returns each store's Icon. NOTE: We are supposed to only use IconURL 
     * from database but that don't seems to work. TODO: Import each store's IconURL from database and remove this.
     * @returns An image of each store's Icon.
     */
    const renderLogo = () => {
        if (0 == storeObject.ID) {
            return (<img className={classes.image} src={ICAlogo} alt="this is ICA image" />);
        }
        if (1 == storeObject.ID) {
            return(<img className={classes.image} src={ApotekHjärtatlogo} alt="this is Apotek image" />);
        }
        if (2 == storeObject.ID) {
            return(<img className={classes.image} src={Systembolagetlogo} alt="this is Systembolaget image" />);
        }
        if (3 == storeObject.ID) {
            return<img className={classes.image} src={hemköplogo} alt="this is Hemköp image" />;
        }
        if (4 == storeObject.ID) {
            return<img className={classes.image} src={Åhlénslogo} alt="this is Åhléns image" />;
        }
        if (5 == storeObject.ID) {
            return<img className={classes.image} src={Maxlogo} alt="this is Max image" />;
        }
        if (6 == storeObject.ID) {
            return<img className={classes.image} src={Arreniuslogo} alt="this is Arrenius image" />;
        }
    }
    
    /**
     * Creates a button the links to either StorePage if the store is full or
     * links to the CheckoutPage if the store is not full.
     * @returns buttons with different links depending on if the store is full or not
     */
    const renderbutton = () => {
        if(storeList[2] == true) {
            return (<Button
                        variant="contained"
                        className={classes.button} 
                        elevation={24}
                        component={Link} to={`${linktwo}/${storeObject.ID}`}>
    
                        <Grid item xs={3}>
                            <Paper className={classes.paper2}>
                                {renderLogo()}
                            </Paper>
                        </Grid>  
    
                        <Grid item xs={10}>                 
                            <Paper className={classes.paper} style={{marginLeft: '-4%'}}>
                                {storeObject.Name}
                                <AttachMoneyIcon className={classes.imageCash}/> 
                                <Paper className={classes.adress} style={{fontSize: 'x-large', marginLeft: '-8px'}}>

                                    {storeObject.Address}
                                </Paper>
                            </Paper>        
                        </Grid>
    
                        {/*<Grid item xs={1}>
                                <Paper className="register" style={{fontSize: 'x-large'}}>
                                    Register
                                </Paper>
                        </Grid>*/}
                   
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                {waitTimeofCheckQueue + " min"}
                            </Paper>
                        </Grid>
                    
                    </Button>);
          }
      if (storeList[2] == false) {
      //if (sensor >= store.Max) {
        return ( <Button
            variant="contained"
            className={classes.button} 
            elevation={24}
            component={Link} to={`${link}/${storeObject.ID}`}>

            <Grid item xs={3}>
                <Paper className={classes.paper2}>  
                    {renderLogo()}
               </Paper>
            </Grid>           

            <Grid item xs={10}>
                <Paper className={classes.paper} style={{marginLeft: '-4px'}}>
                    {storeObject.Name}
                    <StoreIcon className={classes.imageStore}/> 
                    <Paper className={classes.paper} style={{fontSize: 'x-large', marginLeft: '-8px'}}>
                        {storeObject.Address}
                    </Paper>
                </Paper>
            </Grid>

            <Grid item xs={4}>
                <Paper className={classes.paper}>
                    {waitTimeofQueue + " min"}
                </Paper>
            </Grid>
        </Button>);

      } 
    }

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
            {renderbutton()}
            </Grid>
        </div>

    );
};

export default StoreRow;
