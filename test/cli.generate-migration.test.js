var expect    = require('expect.js')
  , Support   = require(__dirname + '/support')
  , dialect   = Support.getTestDialect()
  , _         = Support.Sequelize.Utils._
  , exec      = require('child_process').exec
  , version   = (require(__dirname + '/../package.json')).version
  , path      = require('path')
  , os        = require('os')
  , cli       = "bin/sequelize"

if (os.type().toLowerCase().indexOf('windows') === -1) {
  describe(Support.getTestDialectTeaser("CLI"), function() {
    (function(flags) {
      flags.forEach(function(flag) {
        var cmd = cli + " " + flag

        var prepare = function(callback) {
          exec("rm -rf ./*", { cwd: __dirname + '/tmp' }, function() {
            exec("../../" + cli + " init", { cwd: __dirname + '/tmp' }, function() {
              exec("../../" + cmd + " --name=foo", { cwd: __dirname + '/tmp' }, function() {
                callback.apply(null, [].slice(arguments))
              })
            })
          })
        }

        describe(flag, function() {
          it("creates a new file with the current timestamp", function(done) {
            prepare(function() {
              exec("ls -1 migrations", { cwd: __dirname + '/tmp' }, function(err, stdout) {
                var date   = new Date()
                  , format = function(i) { return (parseInt(i, 10) < 10 ? '0' + i : i)  }
                  , sDate  = [date.getFullYear(), format(date.getMonth() + 1), format(date.getDate()), format(date.getHours()), format(date.getMinutes())].join('')

                expect(stdout).to.match(new RegExp(sDate + "..-foo.js"))
                done()
              })
            })
          })

          it("adds a skeleton with an up and a down method", function(done) {
            prepare(function() {
              exec("cat migrations/*-foo.js", { cwd: __dirname + '/tmp' }, function(err, stdout) {
                expect(stdout).to.contain('up: function(migration, DataTypes, done) {')
                expect(stdout).to.contain('down: function(migration, DataTypes, done) {')
                done()
              })
            })
          })

          it("calls the done callback", function(done) {
            prepare(function() {
              exec("cat migrations/*-foo.js", { cwd: __dirname + '/tmp' }, function(err, stdout) {
                expect(stdout).to.contain('done()')
                expect(stdout.match(/(done\(\))/)).to.have.length(2)
                done()
              })
            })
          })
        })
      })
    })(['generate:migration'])
  })
}