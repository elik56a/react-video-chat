import React, { Component } from 'react';
import PropTypes from 'proptypes';

let friendID;

class MainWindow extends Component {
  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  callWithVideo(video) {
    const config = { audio: true };
    config.video = video;
    return () => this.props.startCall(true, friendID, config);
  }
  render() {

    document.title = 'DocLive - Video Chat';
    return (
      <section>
        <div className="container main-window">
          <div>
            <h3>
              DocLive is available, start a video call now
          </h3>
            <h4>Select Online Doctor From The List Below</h4>
          </div>

          <select id="selectDoc"
            onChange={event => friendID = event.target.value}>
            <option> Doctos Online: </option>
            {this.props.connectedClients.map((client, index) => {
              return <option value={client} key={index}>{client}</option>
            })}
          </select>
          <div className='btns'>
            <button
              className="btn-action fa fa-video-camera"
              onClick={this.callWithVideo(true)}
            />
            <button
              className="btn-action fa fa-phone"
              onClick={this.callWithVideo(false)}
            />
          </div>
        </div>
        <div>
        </div>
      </section>
    );
  }
}

MainWindow.propTypes = {
  clientId: PropTypes.string.isRequired,
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
