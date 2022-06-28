import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Button from "@material-ui/core/Button";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card'
import axios from 'axios';


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
            bottom: '850px',
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
              bottom: '130px',
              left: '5px',
              width: '100%',
              height: '60px', 
          }
    },
    yourTurnDiv: {
        height: 'fit-content',  
        [theme.breakpoints.down('md')]: {
            marginLeft: '250px', 
            marginTop: '-100px',
        },
        [theme.breakpoints.up('lg')]: {
            marginTop: '-120px', 
            margin: 'auto',
            display: 'flex',  
            alignItems: 'center',
            justifyContent: 'center'
        },
    },
    yourTurnText: {
        [theme.breakpoints.down('md')]: {fontSize: '100px'},
        [theme.breakpoints.up('lg')]: {fontSize: '80px'}
    }
  }));

function YourTurnPage(){
    const { id } = useParams();
    const classes = useStyles();
    const [data, setData] = useState([]);

    /*************  stores get *************/
    useEffect(() => {
        axios.get('/API/v1/stores/0')
            .then((response) => {
            
                response.data.filter((store) => {
                    if (store.ID === id){
                        setData(store);
                        const listTemp = [];
                        var queueToken = "";
                        for(let x of window.activeQueues){
                            if(x[0].Name != store.Name){
                                listTemp.push(x)
                            }//This should be removed in production becasue staff is the one who will remove user from queue
                            if(x[0].Name === store.Name){
                                queueToken = x[1];
                            }
                        }
                        window.activeQueues = listTemp;
                        //This should be removed in production becasue staff is the one who will remove user from queue
                        axios.delete('/API/v1/queue/'+id, {headers: {'Queue-Token': queueToken }})
                        .then((response) => {
                            console.log("Delete");
                        })
                        clearInterval(window.intervalStore1);
                        clearInterval(window.intervalStore2);
                        clearInterval(window.intervalStore3);
                    }
                })
            })
    }, []);


    function toCheckoutqueue(){
        /************* post to queue *************/
        axios.post('/API/v1/checkout/queue/'+data.ID)
        .then((response) => {
            const tokenCheckout = response.data.QueueToken;
            window.activeQueues.push([data, tokenCheckout, true])
        })
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

            <div  className={classes.width}>
                <p className={classes.address}>{data.Address}</p>
            </div>

            <div   className={classes.yourTurnDiv}>
                <p className={classes.yourTurnText}>It's your turn!</p>
            </div>

            <div className={classes.ticketContainer}>
                <div className={classes.ticketTextContainer}>
                    <p className={classes.ticketText}>Ticket Number</p>
                </div>

                <div className={classes.ticketNumberTextContainer}>
                    <p className={classes.ticketNumberText}>A120</p>
                </div>
            </div> 
            <div className={classes.zigzag} />
        </Card>
                   
                       
            {/* Link to the page where you stand in line to a store */}

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
                onClick = {toCheckoutqueue}
                component={Link} to={`/queuecheckout/${id}`}>
                Enter queue
            </Button>
        </Grid>
        </div> 
    );
}

export default YourTurnPage;