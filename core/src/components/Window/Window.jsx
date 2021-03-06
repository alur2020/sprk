import React, { Component } from 'react'

import DialogWindow from './DialogWindow.jsx'

export default class Window extends Component {
  constructor (props) {
    super(props)

    this.state = {
      moving: false
    }

    this.moveMouseUp = this.moveMouseUp.bind(this)
    this.moveMouseDown = this.moveMouseDown.bind(this)
    this.move = this.move.bind(this)

    this.resizeMouseUp = this.resizeMouseUp.bind(this)
    this.resizeMouseDown = this.resizeMouseDown.bind(this)
    this.resize = this.resize.bind(this)

    let App

    try {
      App = __non_webpack_require__(`/Volumes/BIG NIGG/Code/electros/apps${this.props.window.appPath}bundle/index.js`).default // eslint-disable-line
    } catch (e) {
      App = { type: 'error', title: 'Critical Error', message: e, buttons: [{ name: 'Close', action: this.closeWindow.bind(this) }] }
    }

    this.state = {
      app: App.type === 'error' ? App : new App()
    }
  }

  moveMouseUp () { window.removeEventListener('mousemove', this.move, true); this.setState({ moving: false }) }
  moveMouseDown () { window.addEventListener('mousemove', this.move, true); this.setState({ moving: true }) }
  move (e) { this.props.moveWindow(this.props.window.windowID, e.movementX, e.movementY) }

  resizeMouseUp () { window.removeEventListener('mousemove', this.resize, true) }
  resizeMouseDown () { window.addEventListener('mousemove', this.resize, true) }
  resize (e) { this.props.resizeWindow(this.props.window.windowID, e.movementX, e.movementY) }

  componentDidMount () {
    if (this.refs.decorations) { this.refs.decorations.addEventListener('mousedown', this.moveMouseDown, false) }
    if (this.refs.resize) { this.refs.resize.addEventListener('mousedown', this.resizeMouseDown, false) }
    window.addEventListener('mouseup', this.moveMouseUp, false)
    window.addEventListener('mouseup', this.resizeMouseUp, false)

    setTimeout(() => this.props.showWindow(this.props.window.windowID), 50)
    if (this.state.app.mount) { this.state.app.mount(this.refs.appMount, this.props) }
  }

  componentWillUnmount () {
    window.removeEventListener('mouseup', this.moveMouseUp, false)
    window.removeEventListener('mouseup', this.resizeMouseUp, false)
  }

  closeWindow () {
    this.props.hideWindow(this.props.window.windowID)
    setTimeout(() => this.props.discardWindow(this.props.window.windowID), 200)
  }

  compareObjects (o1, o2) {
    for (let p in o1) {
      if (o1.hasOwnProperty(p)) {
        if (o1[p] !== o2[p]) {
          return false
        }
      }
    }
    for (let p in o2) {
      if (o2.hasOwnProperty(p)) {
        if (o1[p] !== o2[p]) {
          return false
        }
      }
    }
    return true
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !this.compareObjects(nextProps.window, this.props.window)
  }

  render () {
    const { x, y, height, width, windowID, isFocused, isVisable, closed } = this.props.window

    if (this.state.app.type === 'error') {
      return (
        <DialogWindow
          app={this.state.app}
          focusWindow={this.props.focusWindow}
          windowID={windowID}
          isFocused={isFocused}
          isVisable={isVisable}
        />
      )
    }

    let translate = `translate3d(${x}px, ${y - (isVisable ? 0 : closed ? -24 : 24)}px, 0px)`

    return (
      <div
        className='window'
        style={{
          zIndex: isFocused ? 3 : 2,
          height,
          width,
          transform: translate,
          opacity: isVisable ? 1 : 0,
          transition: this.state.moving ? 'none' : 'opacity 0.2s, transform 0.2s'
        }}
        onClick={() => this.props.focusWindow(windowID)}
        ref='window'
      >
        <div className='windowDecorations' ref='decorations'>
          <p className='windowTitle'>{this.state.app.title ? this.state.app.title : windowID}</p>
          <button className='windowClose' onClick={this.closeWindow.bind(this)} />
        </div>
        <div className='windowContent' ref={`appMount`} />
        <div className='windowResize' ref='resize' />
      </div>
    )
  }
}
