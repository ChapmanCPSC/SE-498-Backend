import React from 'react';
import index from '../Session/withAuthorization'

import renderer from 'react-test-renderer';

test('landing page renders correctly', () => {
  const tree = renderer.create(<index />).toJSON();
  expect(tree).toMatchSnapshot();
});
