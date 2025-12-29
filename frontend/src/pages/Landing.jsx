import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';

const features = [
  {
    title: 'Smart Analytics',
    desc: 'Beautiful charts to understand your money.',
    icon: '📊',
  },
  {
    title: 'Budget Alerts',
    desc: 'Never overspend with smart alerts.',
    icon: '💰',
  },
  {
    title: 'Cloud Receipts',
    desc: 'Upload receipts securely to the cloud.',
    icon: '☁️',
  },
  {
    title: 'Auto Reports',
    desc: 'Monthly PDF reports in your inbox.',
    icon: '📧',
  },
];

const testimonials = [
  {
    name: 'Riya Sharma',
    role: 'Freelancer',
    text: 'SpendWise completely changed how I manage my money.',
  },
  {
    name: 'Arjun Patel',
    role: 'Founder',
    text: 'The analytics and reports are insanely helpful.',
  },
  {
    name: 'Neha Verma',
    role: 'Student',
    text: 'Budget alerts keep me disciplined every month.',
  },
];

const stats = [
  {label: 'Active Users', value: '10K+'},
  {label: 'Expenses Tracked', value: '₹50M+'},
  {label: 'Reports Sent', value: '25K+'},
  {label: 'Cloud Receipts', value: '100K+'},
];

// const fadeUp = {
//   hidden: {opacity: 0, y: 40},
//   visible: {opacity: 1, y: 0},
// };
const fadeUp = {
  hidden: {opacity: 0, y: 40},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.6, ease: 'easeOut'},
  },
};

const fadeLeft = {
  hidden: {opacity: 0, x: -40},
  visible: {
    opacity: 1,
    x: 0,
    transition: {duration: 0.6},
  },
};

const fadeRight = {
  hidden: {opacity: 0, x: 40},
  visible: {
    opacity: 1,
    x: 0,
    transition: {duration: 0.6},
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const Landing = () => {
  const [open, setOpen] = useState (false);
  const [dark, setDark] = useState (
    () => localStorage.getItem ('theme') !== 'light'
  );

  useEffect (
    () => {
      if (dark) {
        document.documentElement.classList.add ('dark');
        localStorage.setItem ('theme', 'dark');
      } else {
        document.documentElement.classList.remove ('dark');
        localStorage.setItem ('theme', 'light');
      }
    },
    [dark]
  );

  return (
    <div className="min-h-screen bg-[#0b0614] dark:bg-[#0b0614] text-white dark:text-white overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-700/40 via-fuchsia-600/20 to-indigo-800/40 blur-3xl" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold tracking-wide">SpendWise</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <a href="#features" className="hover:text-purple-400 transition">
              Features
            </a>
            <a
              href="#testimonials"
              className="hover:text-purple-400 transition"
            >
              Testimonials
            </a>
            <a href="#about" className="hover:text-purple-400 transition">
              About
            </a>
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-900 to-pink-400 shadow-lg shadow-purple-600/40 hover:shadow-pink-500/40 transition px-5 py-2 rounded-full font-semibold"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-600/40 hover:shadow-pink-500/40 transition px-5 py-2 rounded-full font-semibold"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen (!open)}
            className="md:hidden flex flex-col space-y-1.5"
          >
            <span className="w-6 h-0.5 bg-white" />
            <span className="w-6 h-0.5 bg-white" />
            <span className="w-6 h-0.5 bg-white" />
          </button>
        </div>

        {/* Mobile Menu */}
        {open &&
          <div className="md:hidden bg-black/90 px-6 py-6 space-y-4 text-sm">
            <a
              onClick={() => setOpen (false)}
              href="#features"
              className="block"
            >
              Features
            </a>
            <a
              onClick={() => setOpen (false)}
              href="#testimonials"
              className="block"
            >
              Testimonials
            </a>
            <a onClick={() => setOpen (false)} href="#about" className="block">
              About
            </a>

            <Link onClick={() => setOpen (false)} to="/login" className="block">
              Login
            </Link>
            <Link
              onClick={() => setOpen (false)}
              to="/register"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 rounded-full"
            >
              Get Started
            </Link>
          </div>}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 text-center relative">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{duration: 0.8}}
          className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Take Control of Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Money & Insights
              </span>
            </h1>
            <p className="text-gray-300 max-w-xl mb-10">
              Track expenses, set budgets, upload receipts, and get smart analytics — all in one modern dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl shadow-purple-600/40 hover:shadow-pink-500/40 transition px-8 py-3 rounded-full font-semibold"
              >
                Start Free
              </Link>
              <Link
                to="/login"
                className="border border-white/30 hover:border-purple-400 transition px-8 py-3 rounded-full"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <motion.img
            src="https://images.unsplash.com/vector-1738924826862-21a84f52830d?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Analytics"
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 1}}
            className="w-full max-w-md mx-auto"
          />
        </motion.div>
      </section>
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{once: true}}
        className="py-20 px-6 bg-gradient-to-b from-[#0b0614] to-[#120a1f] text-white"
      >


        <section className="py-20 px-6 bg-[#0b0614] text-white">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
      How SpendWise Works
    </h2>
    <p className="text-center text-gray-400 max-w-2xl mx-auto mb-16">
      SpendWise helps you track expenses, analyze spending patterns,
      set budgets and make smarter financial decisions — all in one place.
    </p>

    <div className="grid md:grid-cols-3 gap-8">

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">🟢 Create Account</h3>
        <p className="text-gray-400 text-sm">
          Sign up securely using email & password.
          Your credentials are encrypted and protected.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">💸 Add Transactions</h3>
        <p className="text-gray-400 text-sm">
          Add income or expenses with category, date, payment mode
          and receipt uploads.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">📊 Smart Analytics</h3>
        <p className="text-gray-400 text-sm">
          Visualize spending with charts, trends and
          overspending alerts.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">📁 Reports</h3>
        <p className="text-gray-400 text-sm">
          Download professional PDF and CSV reports
          for monthly and yearly analysis.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">⚙️ Budget Control</h3>
        <p className="text-gray-400 text-sm">
          Set monthly and category budgets and get
          alerts when limits exceed.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">🔐 Secure & Private</h3>
        <p className="text-gray-400 text-sm">
          JWT authentication, protected routes,
          and user-specific data isolation.
        </p>
      </div>

    </div>
  </div>
</section>
      </motion.section>
      

      {/* Stats */}
      <section className="py-16 bg-black/40">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-4">
          {stats.map ((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true}}
              transition={{duration: 0.6, delay: i * 0.1}}
              className="p-6 rounded-xl bg-white/5 backdrop-blur border border-white/10"
            >
              <div className="text-3xl font-bold text-purple-400">
                {s.value}
              </div>
              <div className="text-sm text-gray-300 mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true}}
            transition={{duration: 0.6}}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Powerful Features
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map ((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true}}
                transition={{duration: 0.6, delay: i * 0.1}}
                className="group bg-white/5 backdrop-blur border border-white/10 p-6 rounded-2xl hover:scale-105 transition transform"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-300 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-black/40">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true}}
            transition={{duration: 0.6}}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            What Our Users Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map ((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true}}
                transition={{duration: 0.6, delay: i * 0.1}}
                className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-2xl"
              >
                <p className="text-gray-300 mb-4">“{t.text}”</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-400">{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="py-24 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{once: true}}
          transition={{duration: 0.6}}
          className="max-w-3xl mx-auto px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start managing smarter today
          </h2>
          <p className="text-gray-300 mb-10">
            Join thousands who trust SpendWise for better financial habits.
          </p>
          <Link
            to="/register"
            className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl shadow-purple-600/40 hover:shadow-pink-500/40 transition px-10 py-4 rounded-full font-semibold"
          >
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-4 text-sm">
          <div>
            <div className="text-xl font-bold mb-3">SpendWise</div>
            <p className="text-gray-400">
              Your smart expense & budget companion.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-gray-400">
              <li>Features</li>
              <li>Pricing</li>
              <li>Roadmap</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-gray-400">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Support</div>
            <ul className="space-y-2 text-gray-400">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-10">
          © {new Date ().getFullYear ()} SpendWise.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
