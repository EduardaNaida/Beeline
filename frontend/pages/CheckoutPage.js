import { useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import PeopleIcon from '@material-ui/icons/People';
import { Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card'
import axios from 'axios';
import {Redirect} from 'react-router';





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
            maxWidth: '40%',
            marginLeft: '5%',
            marginTop: '-2%',
        }
    },
    logo: {
        marginTop: '-200px', 
        [theme.breakpoints.down('md')]: {fontSize: '130px'},
        [theme.breakpoints.up('lg')]: {fontSize: '80px'}
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
            fontSize: '35px',
            marginTop: '-60px',
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
        [theme.breakpoints.up('lg')]: {fontSize: '45px', marginTop: '-50px',}
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
    questionText: {
        [theme.breakpoints.down('md')]: {fontSize: '50px', margin: 'auto' },
        [theme.breakpoints.up('lg')]: {fontSize: '30px',margin: 'auto',}
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
    }
  }));

/**
 *  Displays information for the secondpage for a chosen store's insidequeue(queue for the checkout). Like the logo, 
 *  adress, people in store, waiting time and people in line. Also makes it possible 
 *  to stand in line for each store's checkout queue and return to homepage.
 * @returns A page with all informtion regarding a store.
 */
function CheckoutPage(){
    const { id } = useParams();
    const classes = useStyles();
    const [data, setData] = useState([]);
    const [list, setCount] = useState(0);
    const [waitTime, setWaittime] = useState(0);
    const [sensor, setSensor] = useState(0);
    const [waitTimeofQueue, setWaitTimeofQueue]= useState(0);

    
    useEffect(() => {
        /*************  stores get *************/
        axios.get('/API/v1/stores/0')
        .then((response) => {
            response.data.filter((store) => {
                if (store.ID === id){
                    setData(store);
                }
            })
        })
        /*************  Sensor get *************/
        axios.get('/API/v1/sensor/'+id)
        .then((response) => {
            setSensor(response.data.Value);
        })
    }, [data, sensor]);

    useEffect(() => {
        console.log(sensor)
            /************* get checkout Queue length *************/
            axios.get('/API/v1/checkout/queue/length/'+id)
            .then((response) => {
                console.log("Skriv ut queue length: "+ response.data.QueueLength);
                setCount(response.data.QueueLength);
            })
    }, [list]);

    useEffect(() => {    
            /************* get checkout waitingtime *************/
            axios.get('/API/v1/checkout/queue/waittime/'+id)
            .then((response) => {
                console.log("waiting time: "+ response.data.WaitTime);
                setWaittime(Math.round(response.data.WaitTime));  
            })
            
    }, [waitTime]);

    if (waitTimeofQueue === 0 && waitTime && list){
        const timeSec = (waitTime*list)/60;
        setWaitTimeofQueue(Math.round(timeSec));
        console.log("set " + timeSec);
    }

    function check(){
        if(sensor >= data.Max){
            return <Redirect to={`/store/${id}`}/>;
    }

    }

    return(
        <div className={classes.root}>
            {check()}
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
                            <Typography variant="h3" component="h2" className={classes.textSmall} >In store</Typography>
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
                            <Typography variant="h3" component="h2" className={classes.textSmall} >Maximum</Typography>
                        </Paper>
                    </Grid>
                </div>

                <Grid container direction="row" alignItems="center" className={classes.waittimeAndLine}>
                    <Grid item xs={7}>
                        <Paper className={classes.paper}>
                            <Typography variant="h3" component="h2" className={classes.text}>
                                <AccessTimeIcon className={classes.timeIcon}></AccessTimeIcon>
                                {waitTimeofQueue} min
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
            </Card>
                        
            <Grid container spacing={3}>
                <div className={classes.question}>
                    <Paper className={classes.paper} style={{marginLeft: '0%',marginTop: '30px'}}>
                        <Typography variant="h3" component="h2" className={classes.questionText}>
                            Do you want to queue for the cash register?
                        </Typography>
                    </Paper>
                </div>
            </Grid>

            <Grid container spacing={3}>
                <Button
                    variant="contained"
                    className={classes.button}
                    elevation={24}
                    component={Link} to={`/captcha/${id}`}>
                    Enter queue
                </Button>
            </Grid>
        </div>  
    );
}

export default CheckoutPage;
