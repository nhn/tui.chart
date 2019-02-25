describe('User truth test', function() {
  var areYouAwesome = null;
  beforeEach(function() {
    areYouAwesome = true;
  });
  it('should be awesome', function() {
    expect(areYouAwesome).toBeTruthy();
  })
});