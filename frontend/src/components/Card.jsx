import React from "react";
import { motion } from "framer-motion";

function Card({ title, children }) {

  return (

    <motion.div
      initial={{ opacity:0, y:15 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-10 shadow-lg"
    >

      {/* Section Title */}

      <h2 className="text-2xl font-semibold mb-6 border-b border-slate-700 pb-3 text-blue-400">

        {title}

      </h2>

      {/* Section Content */}

      <div>

        {children}

      </div>

    </motion.div>

  );

}

export default Card;