/**
 * Created by Trevor.Zablocki on 3/8/2016.
 */
import React, { Component, PropTypes } from 'react';

const LatestError = ({ error }) => (
  <div>
    {error}
  </div>
)

LatestError.propTypes = {
  error: PropTypes.string.isRequired
}

export default LatestError
