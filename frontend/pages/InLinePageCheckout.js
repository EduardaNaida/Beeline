import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import PeopleIcon from '@material-ui/icons/People';
import { Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card'
import axios from 'axios';
import  { useHistory } from 'react-router-dom'



const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      background: 'transparent',
      boxShadow: 'none',
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    card: {
        paddingTop: '250px', 
        paddingBottom: '120px', 
        borderRadius: '50px',
        [theme.breakpoints.down('md')]: {
            marginTop: '0px', 
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '50%',
            marginLeft: '5%',
            marginTop: '-5%',
        }
    },
    logo: {
        marginTop: '-200px', 
        [theme.breakpoints.down('md')]: {fontSize: '130px'},
        [theme.breakpoints.up('lg')]: {fontSize: '80px'},
    },
    storeLogoContainer: {
        margin: 'auto',
        marginTop: '-20px',
        display: 'flex',  
        alignItems: 'center',
        justifyContent: 'center'
    },
    address: {
        maxWidth: '700px',
        margin: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        [theme.breakpoints.down('md')]: {
            fontSize: '55px',
            marginTop: '-100px',
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '32px',
            marginTop: '-70px',
        }
    },
    addressRegister: {
        maxWidth: '700px',
        margin: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#b58b52',
        [theme.breakpoints.down('md')]: {fontSize: '70px', marginTop: '-100px',},
        [theme.breakpoints.up('lg')]: {fontSize: '42px', marginTop: '-65px',}
    },
    peopleInStoreDiv: {
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            width: '100%',
            height: '300px',
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '70%',
            margin: 'auto',
            height: '160px',
            marginTop: '-10%',
         }
    },
    text: {
        [theme.breakpoints.down('md')]: {fontSize: '100px'},
        [theme.breakpoints.up('lg')]: {fontSize: '50px'}
    },
    textSmall: {
        [theme.breakpoints.down('md')]: {fontSize: '50px'},
        [theme.breakpoints.up('lg')]: {fontSize: '30px'}
    },
    textSmaller: {
        [theme.breakpoints.down('md')]: {fontSize: '1.3 em'},
        [theme.breakpoints.up('lg')]: {fontSize: '30px'}
    },
    slash: {
        [theme.breakpoints.down('md')]: {fontSize: '150px'},
        [theme.breakpoints.up('lg')]: {fontSize: '70px'}
    },
    /*ticketGrid: {
        [theme.breakpoints.down('md')]: {
            marginBottom: '-80px',},
        [theme.breakpoints.up('lg')]: {
            marginBottom: '-50px',
            marginTop: '-20px', }, 
    },
    ticketGrid2: {
        [theme.breakpoints.down('md')]: {
            marginTop: '-90px',},
        [theme.breakpoints.up('lg')]: {
            marginBottom: '-40px',
            marginTop: '-70px', }, 
    },*/
    ticketTextContainer: {
        [theme.breakpoints.down('md')]: {
            maxWidth: '700px',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '-5%', 
            marginRight: '-320px',
            
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '700px',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '-5%', 
            marginRight: '-320px',
            position: 'relative',
            right: '90px',
        }
    },
    ticketText: {
        color: '#000000',
        [theme.breakpoints.down('md')]: {fontSize: '55px',},
        [theme.breakpoints.up('lg')]: {fontSize: '35px',}
    },
    ticketNumberTextContainer: {
        [theme.breakpoints.down('md')]: {
            maxWidth: '700px',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '700px',
            marginLeft: '30px', 
            marginTop: '-50px'
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '700px',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '700px',
            marginLeft: '30px', 
            marginTop: '-50px',
            position: 'relative',
            top: '60px',
            right: '-60px',
        } 

    },
    ticketNumberText: {
        [theme.breakpoints.down('md')]: {fontSize: '150px', marginBottom: '40px'},
        [theme.breakpoints.up('lg')]: {fontSize: '55px'}
    },
    width: {
        [theme.breakpoints.down('md')]: {height: '230px'},
        [theme.breakpoints.up('lg')]: {height: '150px'}
    },
    waittimeAndLine: {
        [theme.breakpoints.up('lg')]: {maxWidth: '80%', margin: 'auto'}
    },
    peopleIcon: {
        [theme.breakpoints.down('md')]: {
           fontSize: '120px', 
            marginRight: "10%", 
            marginBottom: "-5%" 
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '50px', 
            marginRight: "10%", 
            marginBottom: "-5%"
        }
    },
    timeIcon: {
        [theme.breakpoints.down('md')]: {
            fontSize: '120px', 
            marginRight: "3%", 
            marginBottom: "-4%",
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '50px', 
            marginRight: "3%", 
            marginBottom: "-4%"
        },
    },
    margin: {
        [theme.breakpoints.down('md')]: {marginTop: '100px'},
        [theme.breakpoints.up('lg')]: {marginTop: '50px'}
    },
    button: {
        backgroundColor: 'rgb(247,224,193)', 
        borderRadius: '100px',
        [theme.breakpoints.down('md')]: {
            margin: 'auto',
            fontSize: 'xxx-large', 
            marginTop: '250px', 
            maxWidth: '700px', 
            maxHeight: '200px', 
            minWidth: '700px', 
            minHeight: '200px', 
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '35px', 
            marginTop: '40px', 
            maxHeight: '200px',
            minHeight: '200px',  
            minWidth: '35%', 
            maxWidth: '35%', 
            marginLeft: '60%',
            marginTop: '-15%'
        }
    },
    question: {
        backgroundColor: '#f0ffff', 
        maxHeight: '200px', 
        borderRadius: '100px',
        [theme.breakpoints.down('md')]: {
            margin: 'auto', 
            maxWidth: '965px', 
            fontSize: 'xxx-large', 
            minHeight: '200px', 
            minWidth: '965px', 
            marginTop: '40px', 
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '35%',
            minWidth: '35%',
            fontSize: '40px', 
            minHeight: '150px', 
            marginLeft: '60%',
            marginTop: '-30%',
            height: '155px'

        },
    },
    
    ticketContainer: {
        [theme.breakpoints.down('md')]: {
            borderWidth: '13px',
            borderColor: '#000000',
            borderStyle: 'solid',
            maxWidth: '570px',
            margin: 'auto',
            marginTop: '-50px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        [theme.breakpoints.up('lg')]: {
            borderWidth: '10px',
            borderColor: '#000000',
            borderStyle: 'solid',
            maxWidth: '400px',
            margin: 'auto',
            maxHeight: '200px',
            marginTop: '-50px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            
        },
    },
    zigzag: {
        [theme.breakpoints.down('md')]: {
        background: 'linear-gradient(-45deg, #c1d8f7, 25px, transparent 0), linear-gradient(45deg, #c1d8f7, 25px, transparent 0)',
        backgroundPosition: 'left-bottom',
        backgroundRepeat: 'repeat-x',
        backgroundSize: '32px 32px',
        content: '" "',
        display: 'block',
        position: 'absolute',
       // bottom: '20%',
        left: '5px',
        width: '100%',
        height: '60px',
        },
        [theme.breakpoints.up('lg')]: {
            background: 'linear-gradient(-45deg, #c1d8f7, 25px, transparent 0), linear-gradient(45deg, #c1d8f7, 25px, transparent 0)',
            backgroundPosition: 'left-bottom',
            backgroundRepeat: 'repeat-x',
            backgroundSize: '32px 32px',
            content: '" "',
            display: 'block',
            position: 'absolute',
            bottom: '30px',
            left: '5px',
            width: '100%',
            height: '60px', 
        }
    }
  }));
/**
 *  Displays information for the in line page for the checkout queue for a chosen store. Like the logo, 
 *  adress, people in store, waiting time and people in line. Also displays the 
 *  ticket for the user and makes it possible for the user to leave the queue. 
 * @returns a page with all informtion regarding a store and the users ticket.
 */

function InLinePageCheckout(){
    const { id } = useParams();
    const classes = useStyles();
    const [data, setData] = useState([]);
    const [sensor, setSensor] = useState(0);
    const [list, setCount] = useState(0);
    const [waitTime, setWaittime] = useState(0);
    var queueToken = "";
    
   
    useEffect(() => {
        axios.get('/API/v1/stores/0')
        .then((response) => {
            response.data.filter((store) => {
                if (store.ID === id){
                    setData(store);
                    console.log("store: " + store.Name)
                }
            })
        })
    }, []);


    useEffect(() => {
    window.interval1 = setInterval(getSensor, 20000);//20sec
    window.interval2 = setInterval(getPlace, 20000);//20sec
    window.interval3 = setInterval(getWait, 40000);//20sec
    axios.get('/API/v1/stores/0')
    .then((response) => {
        response.data.filter((store) => {
            if (store.ID === id){
                setData(store);
                for(let x of window.activeQueues){
                    if(x[0].Name === store.Name){
                        queueToken = x[1];
                        console.log("queuetoken: " + JSON.stringify(queueToken))
                        axios.get('/API/v1/checkout/queue/'+id, {headers: {'Queue-Token': queueToken }})
                        .then((response) => {
                        setCount(response.data.Index +1);
                         })
                    }
                }
            }
        })
    })
        /*************  get sensor *************/
        axios.get('/API/v1/sensor/'+id)
        .then((response) => {
            setSensor(response.data.Value);
        })
      

        /************* get checkout waitingtime *************/
        axios.get('/API/v1/checkout/queue/waittime/'+id)
        .then((response) => {
            if ((response.data.WaitTime)/60 < 1){
                setWaittime("<1");
            }
            else{
                setWaittime(Math.round((response.data.WaitTime)/60));
            }  
        })
        
    }, []);

    function getSensor() {
        /*************  get sensor *************/
        axios.get('/API/v1/sensor/'+id)
        .then((response) => {
            setSensor(response.data.Value);
            console.log("updated sensor to: " + response.data.Value)
        })
    }

    const history = useHistory();
    function getPlace(){
        /************* get checkout queue length *************/
        axios.get('/API/v1/checkout/queue/'+id, {headers: {'Queue-Token': queueToken }})
        .then((response) => {
            setCount(response.data.Index+1);
            console.log("updated queueplace to: " + (response.data.Index+1))
            console.log("checking if first")
        
        if((response.data.Index+1) <= 1){
            console.log("Inside first function ")
           return history.push(`/yourturncheckout/${id}`);
        } else{
            return;
        }
        })
    }
    function getWait(){
        /************* get checkout waitingtime *************/
        axios.get('/API/v1/checkout/queue/waittime/'+id)
        .then((response) => {
            if ((response.data.WaitTime)/60 < 1){
                setWaittime("<1");
            }
            else{
                setWaittime(Math.round((response.data.WaitTime)/60));
            }  
        })
    }

    /**'
     * Removes the user from the checkout queue with the user specific token
     */
    function removeFromQueue(){
        const list = [];
        //var queueToken = "";
        for(let x of window.activeQueues){
            if(x[0].Name != data.Name){
                list.push(x)
            }
            if(x[0].Name === data.Name){
                window.queueToken = x[1];
            }
        }
        window.activeQueues = list;
        axios.delete('/API/v1/checkout/queue/'+id, {headers: {'Queue-Token': window.queueToken }})
        .then((response) => {
            console.log("Delete");
        })
        clearInterval(window.interval1);
        clearInterval(window.interval2);
        clearInterval(window.interval3);
    }

    return(
        <div className={classes.root}>
            <Link to={`/`}>
                <div>
                    <p className="return"></p>
                </div>
            </Link>

            <Card className={classes.card}>
                <div className={classes.storeLogoContainer}>
                    <p className={classes.logo}>{data.Name}</p>
                </div>
                
                <div className={classes.width}>
                    <p className={classes.addressRegister}>Register</p>
                </div>
            
                <div className={classes.width}>
                    <p className={classes.address}>{data.Address}</p>
                </div>

                <div className={classes.peopleInStoreDiv}>
                    <Grid item xs={6}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h2" className={classes.text}>{sensor}</Typography>
                            <Typography variant="h3" component="h2" className={classes.textSmall}>In store</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={1}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h2" className={classes.slash}>/</Typography>
                        </Paper>
                    </Grid>


                    <Grid item xs={6}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h2" className={classes.text}>{data.Max}</Typography>
                            <Typography variant="h3" component="h2" className={classes.textSmall}>Maximum</Typography>
                        </Paper>
                    </Grid>
                </div>
            
                <div className={classes.ticketContainer}>
                    <div className={classes.ticketTextContainer}>
                        <p className={classes.ticketText}>Ticket Number</p>
                    </div>

                    <div className={classes.ticketNumberTextContainer}>
                        <p className={classes.ticketNumberText}>A120</p>
                    </div>
                </div> 
        

                <Grid container direction="row" alignItems="center" className={classes.waittimeAndLine}>
                    {/* TODO: Import this to another component? */}
                    <Grid item xs={7}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h2" className={classes.text}>
                                <AccessTimeIcon className={classes.timeIcon}></AccessTimeIcon>
                                {waitTime} min
                            </Typography>
                            <Typography variant="h3" component="h2" className={classes.textSmaller} >
                                Approx. wait time
                            </Typography>   
                        </Paper>
                    </Grid>
                
                    <Grid item xs={5}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h2" className={classes.text}>
                                <PeopleIcon className={classes.peopleIcon}></PeopleIcon>
                                {list} 
                            </Typography>
                            <Typography variant="h3" component="h2" className={classes.textSmaller}>
                                Queuing
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
                <div className={classes.zigzag} />
            </Card>
                       
            <Grid container spacing={3}
                  //style={{marginTop: '-150px'}}
                  >
                <Button
                    variant="contained"
                    className={classes.button}
                    elevation={24}
                    onClick={removeFromQueue}
                    component={Link} to={`/`}>
                    Cancel
                </Button>
            </Grid>
           

            <Grid container spacing={3}
                  //style={{marginTop: '-150px'}}
                  >
                <Button
                    variant="contained"
                    className={classes.question}
                    elevation={24}
                    component={Link} to={`/yourturncheckout/${id}`}>
                    Your Turn
                </Button>
            </Grid>*
        </div> 
    );
}

export default InLinePageCheckout;