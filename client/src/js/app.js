import React, { Component } from 'react';
import { render } from 'react-dom';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './companents/MainWindow';
import CallWindow from './companents/CallWindow';
import IncomingCall from './companents/IncomingCall';
import Header from './companents/Header'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: '',
      connectedClients: [],
      callWindow: '',
      IncomingCall: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
  }

  // init the socket
  componentDidMount() {
    socket
      .on('init', data => {
        if (this.state.clientId != '') {
          let connected = this.state.connectedClients;
          connected.push(data.id)
          this.setState({ connectedClients: connected })
        } else {
          this.setState({ clientId: data.id })
        }
      })
      // Getting call from other Dr.
      .on('request', data => this.setState({ IncomingCall: 'active', callFrom: data.from }))
      .on('disconnect', data => {
        let connectedClients = this.state.connectedClients;
        connectedClients.splice(connectedClients.indexOf(data.id), 0)
        this.setState({ connectedClients: connectedClients })
      })

      // Calling other Dr.
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          console.log(this.pc.setRemoteDescription(data.sdp));
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.IncomingCall = '';
        this.setState(newState);
      })
      .on('peerStream', src => this.setState({ peerSrc: src }))
      //this func is beeing send to the PeerConnection
      .start(isCaller, config);
  }

  // when someone call me , and i reject
  rejectCall() {
    socket.emit('end', { to: this.state.callFrom });
    this.setState({ IncomingCall: '' });
  }

  // after bee in call, to end the call, isStarter - in the PeerConnection, Boolian.
  endCall(isStarter) {
    if (_.isFunction(this.pc.stop)) this.pc.stop(isStarter);
    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: '',
      localSrc: null,
      peerSrc: null
    });
  }

  render() {
    return (
      <React.Fragment >
        <Header />
        <MainWindow
          clientId={this.state.clientId}
          startCall={this.startCallHandler}
          connectedClients={this.state.connectedClients}
        />
        <CallWindow
          status={this.state.callWindow}
          localSrc={this.state.localSrc}
          peerSrc={this.state.peerSrc}
          config={this.config}
          mediaDevice={this.pc.mediaDevice}
          endCall={this.endCallHandler}
        />
        <IncomingCall
          status={this.state.IncomingCall}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={this.state.callFrom}
        />
      </ React.Fragment >
    );
  }
}

render(<App />, document.getElementById('root'));

